import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { Course } from '../course/entities/course.entity';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    courseId: string,
    createSectionDto: CreateSectionDto,
    userId: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const existCourse = await manager
        .getRepository(Course)
        .findOneBy({ id: courseId });

      if (!existCourse)
        throw new NotFoundException('해당 코스를 찾을 수 없습니다.');

      if (existCourse.instructorId !== userId)
        throw new UnauthorizedException(
          '해당 코스에 섹션을 추가할 권한이 없습니다.',
        );

      const lastSection = await manager.getRepository(Section).findOne({
        where: { courseId },
        order: { order: 'DESC' },
      });

      const order = lastSection ? lastSection.order + 1 : 0;

      return await manager.getRepository(Section).save({
        ...createSectionDto,
        courseId: courseId,
        order: order,
      });
    });
  }

  async findOne(sectionId: string, userId: string) {
    const section = await this.sectionRepository.findOne({
      where: { id: sectionId },
      relations: {
        course: true,
        lectures: true,
      },
      select: {
        course: {
          id: true,
          instructorId: true,
        },
      },
      order: {
        lectures: { order: 'ASC' },
      },
    });

    if (!section) throw new NotFoundException('섹션을 찾을 수 없습니다.');

    if (section.course.instructorId !== userId)
      throw new UnauthorizedException('이 섹션을 가져올 권한이 없습니다.');

    return section;
  }

  async update(
    sectionId: string,
    updateSectionDto: UpdateSectionDto,
    userId: string,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const section = await manager.getRepository(Section).findOne({
        where: { id: sectionId },
        relations: { course: true },
        select: { course: { instructorId: true } },
      });

      if (!section) throw new NotFoundException('섹션을 찾을 수 없습니다.');

      if (section.course.instructorId !== userId)
        throw new UnauthorizedException('이 섹션을 수정할 권한이 없습니다.');

      await manager.getRepository(Section).update(sectionId, updateSectionDto);

      return manager
        .getRepository(Section)
        .findOne({ where: { id: sectionId } });
    });
  }

  async remove(sectionId: string, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const section = await manager.getRepository(Section).findOne({
        where: { id: sectionId },
        relations: { course: true },
        select: { course: { instructorId: true } },
      });

      if (!section) throw new NotFoundException('섹션을 찾을 수 없습니다.');

      if (section.course.instructorId !== userId)
        throw new UnauthorizedException('이 섹션을 삭제할 권한이 없습니다.');

      return await manager.getRepository(Section).remove(section);
    });
  }
}
