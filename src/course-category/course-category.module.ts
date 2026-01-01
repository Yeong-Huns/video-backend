import { Module } from '@nestjs/common';
import { CourseCategoryService } from './course-category.service';
import { CourseCategoryController } from './course-category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseCategory } from './entities/course-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseCategory])],
  controllers: [CourseCategoryController],
  providers: [CourseCategoryService],
})
export class CourseCategoryModule {}
