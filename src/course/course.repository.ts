import { Brackets, DataSource, Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Injectable } from '@nestjs/common';
import { FindCourseDto } from './dto/request/find-course.dto';
import { CreateCourseDto } from './dto/request/create-course.dto';
import { SearchCourseDto } from './dto/request/search-course.dto';

export interface CourseWithRelations {
  id: string;
  include: string[];
}

@Injectable()
export class CourseRepository extends Repository<Course> {
  constructor(private dataSource: DataSource) {
    super(Course, dataSource.createEntityManager());
  }

  async createCourse(
    userId: string,
    createCourseDto: CreateCourseDto,
    slug: string,
  ) {
    const { categoryIds, ...otherData } = createCourseDto;

    return await this.save({
      ...otherData,
      instructorId: userId,
      slug,
      status: 'DRAFT',
      courseCategories: categoryIds?.map((id) => ({ id })),
    });
  }

  async findAllWithFilters(filters: FindCourseDto) {
    const { title, level, categoryId, skip, take } = filters;

    const query = this.createQueryBuilder('course');

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

  async findOneWithRelations(params: CourseWithRelations) {
    const { id, include } = params;

    return await this.findOne({
      where: { id },
      relations: include,
      relationLoadStrategy: 'query' /* 메모리 터지는거 방지.. */,
    });
  }

  async searchCoursesAndCount(
    params: SearchCourseDto,
  ): Promise<[Course[], number]> {
    const {
      q,
      page = 1,
      pageSize = 20,
      order,
      sortBy,
      priceRange,
      category,
    } = params;

    const queryBuilder = this.createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.courseCategories', 'courseCategories')
      /* enrollmentCount (가상 프로퍼티 매핑) */
      .loadRelationCountAndMap(
        'course.enrollmentCount',
        'course.courseEnrollments',
      )
      /* reviewCount (가상 프로퍼티 매핑) */
      .loadRelationCountAndMap('course.reviewCount', 'course.courseReviews');

    if (q) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('course.title LIKE :searchTerm', {
            searchTerm: `%${q}%`,
          }).orWhere('instructor.name LIKE :searchTerm', {
            searchTerm: `%${q}%`,
          });
        }),
      );
    }

    if (category) {
      queryBuilder.andWhere('courseCategories.id = :categoryId', {
        categoryId: category,
      });
    }

    if (priceRange) {
      const minPrice = priceRange.min ?? 0;
      const maxPrice = priceRange.max ?? Number.MAX_SAFE_INTEGER;
      queryBuilder.andWhere('course.price BETWEEN :min AND :max', {
        min: minPrice,
        max: maxPrice,
      });
    }

    if (sortBy === 'price') {
      queryBuilder.orderBy(
        'course.price',
        order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      );
    } else {
      queryBuilder.orderBy('course.createdAt', 'DESC');
    }

    /* 페이지네이션 */
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    return await queryBuilder.getManyAndCount();
  }
}
