import { IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export const ALLOWED_RELATION = [
  'sections',
  'lectures',
  'courseCategories',
  'courseEnrollments',
  'courseReviews',
  'courseQuestions',
];

export class FindUniqueCourseDto {
  @ApiPropertyOptional({
    description: `포함할 관계 정보. 허용된 값: ${ALLOWED_RELATION.join(', ')}`,
    example: 'sections,lectures',
  })
  @IsOptional()
  @Transform(({ value }): string[] => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }
    return value;
  })
  @IsString({ each: true })
  @IsIn(ALLOWED_RELATION, {
    each: true,
    message: `허용되지않은 relations 가 포함되어 있습니다.`,
  })
  include?: string[];
}
