import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { type RequestWithToken } from '../auth/types/auth';

@ApiTags('미디어 업로드')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        /* ~300MB */
        fileSize: 300 * 1024 * 1024,
      },
    }),
  )
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '미디어 업로드 요청 파일',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '이미지(jpg, png 등) 또는 비디오(mp4 등)',
        },
      },
    },
  })
  @ApiOkResponse({
    description: '미디어 업로드 결과 (videoStorageInfo)',
  })
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithToken,
  ) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다');
    }
    return this.mediaService.uploadMedia(file, req.user.id);
  }
}
