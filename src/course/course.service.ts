import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/request/create-course.dto';
import { UpdateCourseDto } from './dto/request/update-course.dto';
import { FindCourseDto } from './dto/request/find-course.dto';
import { Course } from './entities/course.entity';
import { DataSource } from 'typeorm';
import { CourseCategory } from '../course-category/entities/course-category.entity';
import slug from 'slug';
import { SearchCourseDto } from './dto/request/search-course.dto';
import {
  CourseResponseDto,
  SearchCourseResponseDto,
} from './dto/response/search-response.dto';
import { CourseRepository } from './course.repository';

@Injectable()
export class CourseService {
  constructor(
    /*@InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,*/
    private readonly courseRepository: CourseRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, createCourseDto: CreateCourseDto) {
    const courseSlug = slug(createCourseDto.title);

    /* 참조키 exception -> typeorm-exception.filter 처리 */
    return await this.courseRepository.createCourse(
      userId,
      createCourseDto,
      courseSlug,
    );
  }

  async findAll(queryString: FindCourseDto) {
    return await this.courseRepository.findAllWithFilters(queryString);
  }

  async findOne(id: string, include: string[] = []) {
    return await this.courseRepository.findOneWithRelations({ id, include });
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

  async searchCourses(
    searchCourseDto: SearchCourseDto,
  ): Promise<SearchCourseResponseDto> {
    const [courses, totalItems] =
      await this.courseRepository.searchCoursesAndCount(searchCourseDto);

    const { page = 1, pageSize = 20 } = searchCourseDto;

    const mappedCourses: CourseResponseDto[] = courses.map((course) => ({
      ...course,
      enrollmentCount: course.enrollmentCount ?? 0,
      reviewCount: course.reviewCount ?? 0,
    }));

    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      success: true,
      data: {
        courses: mappedCourses,
        pagination: {
          currentPage: page,
          totalPage: totalPages,
          totalItems,
          hasNext,
          hasPrev,
        },
      },
    };
  }
}
