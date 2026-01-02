import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/request/create-course.dto';
import { UpdateCourseDto } from './dto/request/update-course.dto';
import { FindCourseDto } from './dto/request/find-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { DataSource, Repository } from 'typeorm';
import { CourseCategory } from '../course-category/entities/course-category.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, createCourseDto: CreateCourseDto) {
    const { categoryIds = [], ...otherData } = createCourseDto;

    /* 참조키 exception -> typeorm-exception.filter 처리 */
    return this.dataSource.transaction(async (manager) => {
      return await manager.getRepository(Course).save({
        ...otherData,
        instructorId: userId,
        courseCategories: categoryIds.map((id) => ({ id })),
      });
    });
  }

  findAll(queryString: FindCourseDto) {
    const { title, level, categoryId, skip, take } = queryString;

    const query = this.courseRepository.createQueryBuilder('course');

    query.innerJoinAndSelect('course.courseCategories', 'category');

    if (title)
      query.andWhere('course.title LIKE :title', { title: `%${title}%` });

    if (level) query.andWhere('course.level = :level', { level });

    if (categoryId) query.andWhere('category.id = :categoryId', { categoryId });
    query.orderBy('course.createdAt', 'DESC');

    if (take) query.take(take);

    if (skip) query.skip(skip);

    return query.getMany();
  }

  async findOne(id: string, include: string[] = []) {
    return await this.courseRepository.findOne({
      where: { id },
      relations: include,
      relationLoadStrategy: 'query' /* 메모리 터지는거 방지.. */,
    });
  }

  async update(id: string, userId: string, updateCourseDto: UpdateCourseDto) {
    return await this.dataSource.transaction(async (manager) => {
      const course = await manager.getRepository(Course).findOneBy({ id });

      if (!course)
        throw new NotFoundException(`해당 course 를 찾을 수 없습니다. (${id})`);

      if (course.instructorId !== userId)
        throw new UnauthorizedException('강의 소유자만 수정할 수 있습니다.');

      const { categoryIds, ...otherData } = updateCourseDto;

      manager.getRepository(Course).merge(course, otherData);

      /* 참조키 에러 발생시 -> typeorm-exception.filter */
      if (categoryIds) {
        course.courseCategories = categoryIds.map(
          (id) => ({ id }) as unknown as CourseCategory,
        );
      }

      return await manager.getRepository(Course).save(course);
    });
  }

  async delete(id: string, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const course = await manager.getRepository(Course).findOneBy({ id });

      if (!course)
        throw new NotFoundException(`해당 course 를 찾을 수 없습니다. (${id})`);

      if (course.instructorId !== userId)
        throw new UnauthorizedException('강의 소유자만 삭제할 수 있습니다.');

      await manager.getRepository(Course).delete(id);

      return course;
    });
  }
}
