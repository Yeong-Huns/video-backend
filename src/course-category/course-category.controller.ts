import { Controller, Get } from '@nestjs/common';
import { CourseCategoryService } from './course-category.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseCategory } from './entities/course-category.entity';
import { Public } from '../auth/decorator/public.decorator';

@ApiTags('카테고리')
@Controller('course-category')
export class CourseCategoryController {
  constructor(private readonly courseCategoryService: CourseCategoryService) {}

  @ApiOperation({ summary: '카테고리 리스트' })
  @ApiOkResponse({
    description: '카테고리 조회 성공',
    type: CourseCategory,
    isArray: true,
  })
  @Public()
  @Get()
  findAll() {
    return this.courseCategoryService.findAll();
  }
}
