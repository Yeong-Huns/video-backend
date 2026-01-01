import { PartialType } from '@nestjs/swagger';
import { CreateLectureActivityDto } from './create-lecture-activity.dto';

export class UpdateLectureActivityDto extends PartialType(
  CreateLectureActivityDto,
) {}
