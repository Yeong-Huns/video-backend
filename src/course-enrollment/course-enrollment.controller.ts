import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CourseEnrollmentService } from './course-enrollment.service';
import { CreateCourseEnrollmentDto } from './dto/create-course-enrollment.dto';
import { UpdateCourseEnrollmentDto } from './dto/update-course-enrollment.dto';

@Controller('course-enrollment')
export class CourseEnrollmentController {
  constructor(
    private readonly courseEnrollmentService: CourseEnrollmentService,
  ) {}

  @Post()
  create(@Body() createCourseEnrollmentDto: CreateCourseEnrollmentDto) {
    return this.courseEnrollmentService.create(createCourseEnrollmentDto);
  }

  @Get()
  findAll() {
    return this.courseEnrollmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseEnrollmentService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseEnrollmentDto: UpdateCourseEnrollmentDto,
  ) {
    return this.courseEnrollmentService.update(+id, updateCourseEnrollmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseEnrollmentService.remove(+id);
  }
}
