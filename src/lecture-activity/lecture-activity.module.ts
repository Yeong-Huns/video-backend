import { Module } from '@nestjs/common';
import { LectureActivityService } from './lecture-activity.service';
import { LectureActivityController } from './lecture-activity.controller';
import { LectureActivity } from './entities/lecture-activity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([LectureActivity])],
  controllers: [LectureActivityController],
  providers: [LectureActivityService],
})
export class LectureActivityModule {}
