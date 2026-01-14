import { Global, Module } from '@nestjs/common';
import { ENV_VARIABLES, R2_CLIENT } from '../common/const/env.variables';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Global()
@Module({
  providers: [
    {
      provide: R2_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new S3Client({
          region: 'auto',
          endpoint: configService.getOrThrow<string>(ENV_VARIABLES.r2Endpoint),
          credentials: {
            accessKeyId: configService.getOrThrow<string>(
              ENV_VARIABLES.r2AccessKeyId,
            ),
            secretAccessKey: configService.getOrThrow<string>(
              ENV_VARIABLES.r2SecretAccessKey,
            ),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [R2_CLIENT],
})
export class StorageModule {}
