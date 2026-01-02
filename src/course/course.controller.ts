import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { UpdateCourseDto } from './dto/request/update-course.dto';
import { FindCourseDto } from './dto/request/find-course.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCourseDto } from './dto/request/create-course.dto';
import { type RequestWithToken } from '../auth/types/auth';
import { FindUniqueCourseDto } from './dto/request/find-unique-course.dto';

@ApiTags('강의 코스')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @ApiOperation({ summary: 'Course 생성' })
  @ApiBearerAuth('access-token')
  @Post()
  create(
    @Req() req: RequestWithToken,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    return this.courseService.create(req.user.id, createCourseDto);
  }

  @ApiOperation({ summary: 'Course 목록 조회' })
  @Get()
  findAll(@Query() queryString: FindCourseDto) {
    return this.courseService.findAll(queryString);
  }

  @ApiOperation({ summary: 'Course 상세 조회' })
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: FindUniqueCourseDto,
  ) {
    return this.courseService.findOne(id, query.include);
  }

  @ApiOperation({ summary: 'Course 수정' })
  @ApiBearerAuth('access-token')
  @Patch(':id')
  update(
    @Req() req: RequestWithToken,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.courseService.update(id, req.user.id, updateCourseDto);
  }

  @ApiOperation({ summary: 'Course 삭제' })
  @ApiBearerAuth('access-token')
  @Delete(':id')
  delete(@Req() req: RequestWithToken, @Param('id', ParseUUIDPipe) id: string) {
    return this.courseService.delete(id, req.user.id);
  }
}
