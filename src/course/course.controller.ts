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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCourseDto } from './dto/request/create-course.dto';
import { type RequestWithToken } from '../auth/types/auth';
import { FindUniqueCourseDto } from './dto/request/find-unique-course.dto';
import { Course } from './entities/course.entity';
import { Public } from '../auth/decorator/public.decorator';
import { SearchCourseResponseDto } from './dto/response/search-response.dto';
import { SearchCourseDto } from './dto/request/search-course.dto';

@ApiTags('강의 코스')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @ApiOperation({ summary: 'Course 생성' })
  @ApiBearerAuth('access-token')
  @ApiCreatedResponse({
    description: '생성된 코스 정보',
    type: Course,
  })
  @Post()
  create(
    @Req() req: RequestWithToken,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    return this.courseService.create(req.user.id, createCourseDto);
  }

  @ApiOperation({ summary: 'Course 목록 조회' })
  @ApiOkResponse({ type: Course, isArray: true })
  @Public()
  @Get()
  findAll(@Query() queryString: FindCourseDto) {
    return this.courseService.findAll(queryString);
  }

  @ApiOperation({ summary: 'Course 상세 조회(단건)' })
  @ApiOkResponse({ type: Course })
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: FindUniqueCourseDto,
  ) {
    return this.courseService.findOne(id, query.include);
  }

  @ApiOperation({ summary: 'Course 수정' })
  @ApiOkResponse({ description: '수정된 코스 정보', type: Course })
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
  @ApiOkResponse({ description: '삭제된 코스 정보', type: Course })
  @ApiBearerAuth('access-token')
  @Delete(':id')
  delete(@Req() req: RequestWithToken, @Param('id', ParseUUIDPipe) id: string) {
    return this.courseService.delete(id, req.user.id);
  }

  @ApiOkResponse({
    description: '코스 검색',
    type: SearchCourseResponseDto,
  })
  @Public()
  @Post('search')
  search(@Body() searchCourseDto: SearchCourseDto) {
    return this.courseService.searchCourses(searchCourseDto);
  }
}
