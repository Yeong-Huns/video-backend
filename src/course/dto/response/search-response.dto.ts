import { ApiProperty } from '@nestjs/swagger';
import { Course } from '../../entities/course.entity';

export class PaginationDto {
  @ApiProperty({ description: '현재 페이지' })
  currentPage: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPage: number;

  @ApiProperty({ description: '전체 아이템 수' })
  totalItems: number;

  @ApiProperty({ description: '다음 페이지 존재 여부' })
  hasNext: boolean;

  @ApiProperty({ description: '이전 페이지 존재 여부' })
  hasPrev: boolean;
}

export class CourseResponseDto extends Course {
  @ApiProperty({ description: '수강생 수' })
  enrollmentCount: number;

  @ApiProperty({ description: '리뷰 수' })
  reviewCount: number;
}

export class SearchCourseDataDto {
  @ApiProperty({
    description: '강의 목록',
    isArray: true,
    type: CourseResponseDto,
  })
  courses: CourseResponseDto[];

  @ApiProperty({ description: '페이지네이션 정보', type: PaginationDto })
  pagination: PaginationDto;
}

export class SearchCourseResponseDto {
  @ApiProperty({ description: '성공 여부', default: true })
  success: boolean;

  @ApiProperty({ description: '응답 데이터', type: SearchCourseDataDto })
  data: SearchCourseDataDto;
}
