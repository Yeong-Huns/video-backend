import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CourseReviewService } from './course-review.service';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';
import { UpdateCourseReviewDto } from './dto/update-course-review.dto';

@Controller('course-review')
export class CourseReviewController {
  constructor(private readonly courseReviewService: CourseReviewService) {}

  @Post()
  create(@Body() createCourseReviewDto: CreateCourseReviewDto) {
    return this.courseReviewService.create(createCourseReviewDto);
  }

  @Get()
  findAll() {
    return this.courseReviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseReviewService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseReviewDto: UpdateCourseReviewDto) {
    return this.courseReviewService.update(+id, updateCourseReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseReviewService.remove(+id);
  }
}
