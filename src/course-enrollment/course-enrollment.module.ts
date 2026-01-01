import { Module } from '@nestjs/common';
import { CourseEnrollmentService } from './course-enrollment.service';
import { CourseEnrollmentController } from './course-enrollment.controller';
import { CourseEnrollment } from './entities/course-enrollment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEnrollment])],
  controllers: [CourseEnrollmentController],
  providers: [CourseEnrollmentService],
})
export class CourseEnrollmentModule {}
