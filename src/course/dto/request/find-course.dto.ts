import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindCourseDto {
  @ApiPropertyOptional({ description: '강의 제목 검색' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '난이도 필터' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: '카테고리 ID 필터' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: '건너뛸 개수 (Pagination)' })
  @IsOptional()
  @IsInt()
  skip?: number;

  @ApiPropertyOptional({ description: '가져올 개수 (Pagination)' })
  @IsOptional()
  @IsInt()
  take?: number;
}
