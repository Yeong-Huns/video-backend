import { PartialType } from '@nestjs/swagger';
import { CreateCourseQuestionDto } from './create-course-question.dto';

export class UpdateCourseQuestionDto extends PartialType(
  CreateCourseQuestionDto,
) {}
