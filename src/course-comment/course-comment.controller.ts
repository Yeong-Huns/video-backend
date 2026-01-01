import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CourseCommentService } from './course-comment.service';
import { CreateCourseCommentDto } from './dto/create-course-comment.dto';
import { UpdateCourseCommentDto } from './dto/update-course-comment.dto';

@Controller('course-comment')
export class CourseCommentController {
  constructor(private readonly courseCommentService: CourseCommentService) {}

  @Post()
  create(@Body() createCourseCommentDto: CreateCourseCommentDto) {
    return this.courseCommentService.create(createCourseCommentDto);
  }

  @Get()
  findAll() {
    return this.courseCommentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseCommentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseCommentDto: UpdateCourseCommentDto) {
    return this.courseCommentService.update(+id, updateCourseCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseCommentService.remove(+id);
  }
}
