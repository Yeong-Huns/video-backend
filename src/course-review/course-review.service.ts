import { Injectable } from '@nestjs/common';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';
import { UpdateCourseReviewDto } from './dto/update-course-review.dto';

@Injectable()
export class CourseReviewService {
  create(createCourseReviewDto: CreateCourseReviewDto) {
    return 'This action adds a new courseReview';
  }

  findAll() {
    return `This action returns all courseReview`;
  }

  findOne(id: number) {
    return `This action returns a #${id} courseReview`;
  }

  update(id: number, updateCourseReviewDto: UpdateCourseReviewDto) {
    return `This action updates a #${id} courseReview`;
  }

  remove(id: number) {
    return `This action removes a #${id} courseReview`;
  }
}
