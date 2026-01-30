import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import BaseEntity from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Section } from '../../section/entities/section.entity';
import { Lecture } from '../../lecture/entities/lecture.entity';
import { CourseCategory } from '../../course-category/entities/course-category.entity';
import { CourseEnrollment } from '../../course-enrollment/entities/course-enrollment.entity';
import { CourseReview } from '../../course-review/entities/course-review.entity';
import { CourseQuestion } from '../../course-question/entities/course-question.entity';

@Entity()
export class Course extends BaseEntity {
  /* 필수 필드 */
  @ApiProperty({
    description: '강의 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '강의 슬러그', example: 'nestjs-basic' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ description: '강의 제목', example: 'NestJS 기초' })
  @Column()
  title: string;

  @ApiProperty({ description: '강의 가격', example: 10000, default: 0 })
  @Column({ default: 0 })
  price: number;

  @ApiProperty({
    description: '강의 난이도',
    example: 'BEGINNER',
    default: 'BEGINNER',
  })
  @Column({ default: 'BEGINNER' })
  level: string;

  @ApiProperty({ description: '강의 상태', example: 'DRAFT', default: 'DRAFT' })
  @Column({ default: 'DRAFT' })
  status: string;

  /* optional 필드 */
  @ApiProperty({
    description: '강의 짧은 설명',
    example: 'NestJS를 이용한 백엔드 개발 기초',
    required: false,
    nullable: true,
  })
  @Column({ name: 'short_description', nullable: true })
  shortDescription?: string;

  @ApiProperty({
    description: '강의 상세 설명',
    example: '이 강의는...',
    required: false,
    nullable: true,
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: '강의 썸네일 URL',
    example: 'https://example.com/image.jpg',
    required: false,
    nullable: true,
  })
  @Column({ nullable: true })
  thumbnail?: string;

  @ApiProperty({
    description: '할인 가격',
    example: 9000,
    required: false,
    nullable: true,
  })
  @Column({ nullable: true })
  discountPrice?: number;

  /* 외래키 */
  @ApiProperty({
    description: '강사 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'instructor_id', type: 'uuid' })
  instructorId: string;

  /* 연관관계 */
  @ApiProperty({ type: () => User, description: '강사 정보' })
  @ManyToOne(() => User, (user) => user.courses)
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;

  @ApiProperty({ type: () => [Section], description: '섹션 목록' })
  @OneToMany(() => Section, (section) => section.course)
  sections: Section[];

  @ApiProperty({ type: () => [Lecture], description: '강의 목록' })
  @OneToMany(() => Lecture, (lecture) => lecture.course)
  lectures: Lecture[];

  @ApiProperty({
    type: () => [CourseCategory],
    description: '강의 카테고리 목록',
  })
  @ManyToMany(() => CourseCategory, (courseCategory) => courseCategory.courses)
  @JoinTable({ name: 'course_category_course' })
  courseCategories: CourseCategory[];

  @ApiProperty({
    type: () => [CourseEnrollment],
    description: '수강 신청 목록',
  })
  @OneToMany(
    () => CourseEnrollment,
    (courseEnrollment) => courseEnrollment.course,
  )
  courseEnrollments: CourseEnrollment[];

  @ApiProperty({ type: () => [CourseReview], description: '강의 리뷰 목록' })
  @OneToMany(() => CourseReview, (courseReview) => courseReview.course)
  courseReviews: CourseReview[];

  @ApiProperty({ type: () => [CourseQuestion], description: '강의 질문 목록' })
  @OneToMany(() => CourseQuestion, (courseQuestion) => courseQuestion.course)
  courseQuestions: CourseQuestion[];

  @ApiProperty({ description: '수강생 수', required: false, nullable: true })
  enrollmentCount?: number;

  @ApiProperty({ description: '리뷰 수', required: false, nullable: true })
  reviewCount?: number;
}
