import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Lecture } from './entities/lecture.entity';
import { Section } from '../section/entities/section.entity';

@Injectable()
export class LectureService {
  constructor(
    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    sectionId: string,
    createLectureDto: CreateLectureDto,
    userId: string,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const section = await manager.getRepository(Section).findOne({
        where: { id: sectionId },
        relations: { course: true },
        select: {
          id: true,
          courseId: true,
          course: { instructorId: true },
        },
      });

      if (!section) throw new NotFoundException('섹션을 찾을 수 없습니다.');

      if (section.course.instructorId !== userId)
        throw new UnauthorizedException(
          '이 섹션에 강의를 추가할 권한이 없습니다.',
        );

      const lastLecture = await manager.getRepository(Lecture).findOne({
        where: { sectionId },
        order: { order: 'DESC' },
      });

      const order = lastLecture ? lastLecture.order + 1 : 0;

      return await manager.getRepository(Lecture).save({
        ...createLectureDto,
        sectionId: sectionId,
        courseId: section.courseId,
        order: order,
      });
    });
  }

  async findOne(lectureId: string, userId: string) {
    const lecture = await this.lectureRepository.findOne({
      where: { id: lectureId },
      relations: { course: true },
      select: { course: { instructorId: true } },
    });

    if (!lecture) throw new NotFoundException('개별 강의를 찾을 수 없습니다.');

    if (lecture.course.instructorId !== userId)
      throw new UnauthorizedException('이 강의를 조회할 권한이 없습니다.');

    return lecture;
  }

  async update(
    lectureId: string,
    updateLectureDto: UpdateLectureDto,
    userId: string,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const lecture = await manager.getRepository(Lecture).findOne({
        where: { id: lectureId },
        relations: { course: true },
        select: { course: { instructorId: true } },
      });

      if (!lecture)
        throw new NotFoundException('개별 강의를 찾을 수 없습니다.');

      if (lecture.course.instructorId !== userId)
        throw new UnauthorizedException('해당 강의를 수정할 권한이 없습니다.');

      await manager.getRepository(Lecture).update(lectureId, updateLectureDto);

      return await manager
        .getRepository(Lecture)
        .findOne({ where: { id: lectureId } });
    });
  }

  async remove(lectureId: string, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const lecture = await manager.getRepository(Lecture).findOne({
        where: { id: lectureId },
        relations: { course: true },
        select: { course: { instructorId: true } },
      });

      if (!lecture)
        throw new NotFoundException('개별 강의를 찾을 수 없습니다.');

      if (lecture.course.instructorId !== userId)
        throw new UnauthorizedException('이 강의를 삭제할 권한이 없습니다.');

      return await manager.getRepository(Lecture).remove(lecture);
    });
  }
}
