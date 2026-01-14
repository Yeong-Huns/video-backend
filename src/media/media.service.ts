import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ENV_VARIABLES, R2_CLIENT } from '../common/const/env.variables';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';

@Injectable()
export class MediaService {
  private readonly bucketName: string;
  private readonly publicDomain: string;
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @Inject(R2_CLIENT) private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.getOrThrow<string>(
      ENV_VARIABLES.r2BucketName,
    );
    this.publicDomain = this.configService.getOrThrow<string>(
      ENV_VARIABLES.r2PublicDomain,
    );
  }

  async uploadMedia(file: Express.Multer.File, userId: string) {
    const fileExtension = file.originalname.split('.').pop() || '';
    const key = `media/${userId}/${v4()}.${fileExtension}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return {
        storageType: 'r2',
        r2: {
          bucket: this.bucketName,
          region: 'auto',
          metadata: {
            uploadedAt: new Date().toISOString(),
            contentType: file.mimetype,
          },
        },
        public: {
          url: this.getMediaUrl(key),
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`File upload failed: ${error.message}`, error.stack);
      } else {
        this.logger.error(
          'File upload failed with unknown error',
          String(error),
        );
      }
      throw new InternalServerErrorException(
        '파일 업로드 중 오류가 발생했습니다.',
      );
    }
  }

  private getMediaUrl(key: string) {
    const domain = this.publicDomain.replace(/\/+$/, '');
    const path = key.replace(/^\/+/, '');
    return `${domain}/${path}`;
  }
}
