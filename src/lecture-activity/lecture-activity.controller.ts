import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LectureActivityService } from './lecture-activity.service';
import { CreateLectureActivityDto } from './dto/create-lecture-activity.dto';
import { UpdateLectureActivityDto } from './dto/update-lecture-activity.dto';

@Controller('lecture-activity')
export class LectureActivityController {
  constructor(private readonly lectureActivityService: LectureActivityService) {}

  @Post()
  create(@Body() createLectureActivityDto: CreateLectureActivityDto) {
    return this.lectureActivityService.create(createLectureActivityDto);
  }

  @Get()
  findAll() {
    return this.lectureActivityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lectureActivityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLectureActivityDto: UpdateLectureActivityDto) {
    return this.lectureActivityService.update(+id, updateLectureActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lectureActivityService.remove(+id);
  }
}
