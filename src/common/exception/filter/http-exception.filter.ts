import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { formatDate } from '../../utils/format-date.util';

interface ExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = '';

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const responseBody = exceptionResponse as ExceptionResponse;
      if (Array.isArray(responseBody.message)) {
        message = responseBody.message[0];
      } else message = responseBody.message;
    }

    if (status === 401 && message === 'Unauthorized') {
      message = '인증 오류가 발생하였습니다.';
    }

    if (status === 500 && message === 'internal server error') {
      message = '예기치 않은 오류가 발생하였습니다. 관리자에게 문의하세요.';
    }

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      exception.stack,
    );

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: formatDate(new Date()),
    });
  }
}
