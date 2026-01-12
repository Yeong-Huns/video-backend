import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseCategory } from './entities/course-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CourseCategoryService {
  constructor(
    @InjectRepository(CourseCategory)
    private readonly courseCategoryRepository: Repository<CourseCategory>,
  ) {}

  async findAll() {
    return await this.courseCategoryRepository.find({
      order: { createdAt: 'asc' },
    });
  }
}
