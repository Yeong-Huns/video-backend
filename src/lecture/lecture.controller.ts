import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { LectureService } from './lecture.service';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Lecture } from './entities/lecture.entity';
import { type RequestWithToken } from '../auth/types/auth';

@ApiTags('개별 강의')
@Controller('lecture')
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  @ApiOperation({ summary: '새 강의 생성' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'sectionId', description: '섹션 ID' })
  @ApiBody({ type: CreateLectureDto })
  @ApiOkResponse({ description: '강의 생성 성공', type: Lecture })
  @Post('sections/:sectionId/lectures')
  create(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() createLectureDto: CreateLectureDto,
    @Req() req: RequestWithToken,
  ) {
    return this.lectureService.create(sectionId, createLectureDto, req.user.id);
  }

  @ApiOperation({ summary: '개별 강의 상세 정보' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'lectureId', description: '개별 강의 ID' })
  @ApiOkResponse({ description: '개별 강의 상세 정보 조회', type: Lecture })
  @Get(':lectureId')
  findOne(
    @Param('lectureId', ParseUUIDPipe) lectureId: string,
    @Req() req: RequestWithToken,
  ) {
    return this.lectureService.findOne(lectureId, req.user.id);
  }

  @ApiOperation({ summary: '개별 강의 수정' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'lectureId', description: '개별 강의 ID' })
  @ApiBody({ type: UpdateLectureDto })
  @ApiOkResponse({ description: '개별 강의 수정 성공', type: Lecture })
  @Patch(':lectureId')
  update(
    @Param('lectureId', ParseUUIDPipe) lectureId: string,
    @Body() updateLectureDto: UpdateLectureDto,
    @Req() req: RequestWithToken,
  ) {
    return this.lectureService.update(lectureId, updateLectureDto, req.user.id);
  }

  @ApiOperation({ summary: '개별 강의 삭제' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'lectureId', description: '개별 강의 ID' })
  @ApiOkResponse({ description: '개별 강의 삭제 성공', type: Lecture })
  @Delete(':lectureId')
  remove(
    @Param('lectureId', ParseUUIDPipe) lectureId: string,
    @Req() req: RequestWithToken,
  ) {
    return this.lectureService.remove(lectureId, req.user.id);
  }
}
