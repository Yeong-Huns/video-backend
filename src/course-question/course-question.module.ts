import { Module } from '@nestjs/common';
import { CourseQuestionService } from './course-question.service';
import { CourseQuestionController } from './course-question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseQuestion } from './entities/course-question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseQuestion])],
  controllers: [CourseQuestionController],
  providers: [CourseQuestionService],
})
export class CourseQuestionModule {}
