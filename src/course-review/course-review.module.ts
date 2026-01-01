import { Module } from '@nestjs/common';
import { CourseReviewService } from './course-review.service';
import { CourseReviewController } from './course-review.controller';
import { CourseReview } from './entities/course-review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CourseReview])],
  controllers: [CourseReviewController],
  providers: [CourseReviewService],
})
export class CourseReviewModule {}
