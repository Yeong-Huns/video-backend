import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CourseQuestionService } from './course-question.service';
import { CreateCourseQuestionDto } from './dto/create-course-question.dto';
import { UpdateCourseQuestionDto } from './dto/update-course-question.dto';

@Controller('course-question')
export class CourseQuestionController {
  constructor(private readonly courseQuestionService: CourseQuestionService) {}

  @Post()
  create(@Body() createCourseQuestionDto: CreateCourseQuestionDto) {
    return this.courseQuestionService.create(createCourseQuestionDto);
  }

  @Get()
  findAll() {
    return this.courseQuestionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseQuestionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseQuestionDto: UpdateCourseQuestionDto,
  ) {
    return this.courseQuestionService.update(+id, updateCourseQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseQuestionService.remove(+id);
  }
}
