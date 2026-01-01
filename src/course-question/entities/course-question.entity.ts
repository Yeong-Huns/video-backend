import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import BaseEntity from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';
import { CourseComment } from '../../course-comment/entities/course-comment.entity';

@Entity('course_question')
export class CourseQuestion extends BaseEntity {
  /* 필수 */
  @ApiProperty({
    description: '질문 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '질문 제목', example: '질문이 있습니다.' })
  @Column()
  title: string;

  @ApiProperty({ description: '질문 내용', example: '이 부분이 궁금합니다.' })
  @Column()
  content: string;

  /* Optional */
  /* FK */
  @ApiProperty({
    description: '작성자 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ApiProperty({
    description: '강의 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  /* 연관 관계 */
  @ApiProperty({ type: () => User, description: '작성자 정보' })
  @ManyToOne(() => User, (user) => user.courseQuestions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ type: () => Course, description: '강의 정보' })
  @ManyToOne(() => Course, (course) => course.courseQuestions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ApiProperty({ type: () => [CourseComment], description: '댓글 목록' })
  @OneToMany(
    () => CourseComment,
    (courseComment) => courseComment.courseQuestion,
  )
  courseComments: CourseComment[];
}
