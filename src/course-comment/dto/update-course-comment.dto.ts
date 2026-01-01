import { PartialType } from '@nestjs/swagger';
import { CreateCourseCommentDto } from './create-course-comment.dto';

export class UpdateCourseCommentDto extends PartialType(
  CreateCourseCommentDto,
) {}
