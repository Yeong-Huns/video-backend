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
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { type RequestWithToken } from '../auth/types/auth';
import { Section } from './entities/section.entity';

@ApiTags('섹션')
@Controller('section')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @ApiOperation({ summary: '새 섹션 생성' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'courseId', description: '코스 ID' })
  @ApiBody({ type: CreateSectionDto })
  @ApiOkResponse({
    description: '섹션 생성 설명',
    type: Section,
  })
  @Post('/courses/:courseId/sections')
  create(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() createSectionDto: CreateSectionDto,
    @Req() req: RequestWithToken,
  ) {
    return this.sectionService.create(courseId, createSectionDto, req.user.id);
  }

  @ApiOperation({ summary: '섹션 상세 조회' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'sectionId', description: '섹션 ID' })
  @ApiOkResponse({
    description: '섹션 상세 정보',
    type: Section,
  })
  @Get('/sections/:sectionId')
  findOne(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Req() req: RequestWithToken,
  ) {
    return this.sectionService.findOne(sectionId, req.user.id);
  }

  @ApiOperation({ summary: '섹션 업데이트' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'sectionId', description: '섹션 ID' })
  @ApiBody({ type: UpdateSectionDto })
  @ApiOkResponse({
    description: '섹션 업데이트 성공',
    type: Section,
  })
  @Patch(':sectionId')
  update(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() updateSectionDto: UpdateSectionDto,
    @Req() req: RequestWithToken,
  ) {
    return this.sectionService.update(sectionId, updateSectionDto, req.user.id);
  }

  @ApiOperation({ summary: '섹션 삭제' })
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'sectionId', description: '섹션 ID' })
  @ApiOkResponse({
    description: '섹션 삭제 성공',
    type: Section,
  })
  @Delete(':sectionId')
  remove(
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Req() req: RequestWithToken,
  ) {
    return this.sectionService.remove(sectionId, req.user.id);
  }
}
