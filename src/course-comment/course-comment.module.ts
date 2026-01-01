import { Module } from '@nestjs/common';
import { CourseCommentService } from './course-comment.service';
import { CourseCommentController } from './course-comment.controller';
import { CourseComment } from './entities/course-comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CourseComment])],
  controllers: [CourseCommentController],
  providers: [CourseCommentService],
})
export class CourseCommentModule {}
