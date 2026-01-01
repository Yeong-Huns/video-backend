import { PartialType } from '@nestjs/swagger';
import { CreateCourseReviewDto } from './create-course-review.dto';

export class UpdateCourseReviewDto extends PartialType(CreateCourseReviewDto) {}
