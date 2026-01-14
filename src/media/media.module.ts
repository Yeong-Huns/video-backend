import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MulterModule } from '@nestjs/platform-express';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 300 * 1024 * 1024,
      },
    }),
    StorageModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
