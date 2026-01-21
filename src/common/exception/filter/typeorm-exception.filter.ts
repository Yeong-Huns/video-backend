import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { formatDate } from '../../utils/format-date.util';
import type { Request, Response } from 'express';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { captureException } from '@sentry/nestjs';

interface MysqlError {
  code: string;
  errno: number;
  sqlMessage: string;
  sqlState: string;
}

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('TypeOrmExceptionFilter');

  @SentryExceptionCaptured()
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    captureException(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '데이터베이스 처리 중 오류가 발생했습니다.';

    const driverError = exception.driverError as unknown as MysqlError;

    if (driverError) {
      const errorCode = driverError.errno;

      switch (errorCode) {
        case 1452:
          status = HttpStatus.BAD_REQUEST;
          message = '존재하지 않는 참조 키를 포함하고 있습니다.';
          break;

        case 1451:
          status = HttpStatus.CONFLICT;
          message =
            '해당 데이터를 참조하는 다른 데이터가 있어 삭제/수정할 수 없습니다.';
          break;

        case 1062:
          status = HttpStatus.CONFLICT;
          message = '이미 존재하는 데이터입니다.';
          break;

        case 1048:
          status = HttpStatus.BAD_REQUEST;
          message = '필수 입력 값이 누락되었습니다.';
          break;

        case 1406:
          status = HttpStatus.BAD_REQUEST;
          message = '입력된 데이터의 길이가 허용 범위를 초과했습니다.';
          break;

        case 1054:
          status = HttpStatus.BAD_REQUEST;
          message = '요청하신 데이터 필드가 올바르지 않습니다.';
          break;

        case 1264:
          status = HttpStatus.BAD_REQUEST;
          message = '입력된 숫자가 허용 범위를 벗어났습니다.';
          break;

        default:
          this.logger.error(
            `Unhandled DB Error: errno=${errorCode}, code=${driverError.code}, message=${driverError.sqlMessage}`,
          );
      }
    }

    this.logger.error(`DB Error [${status}]: ${message}`, exception.stack);

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: formatDate(new Date()),
    });
  }
}
