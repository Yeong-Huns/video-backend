import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import BaseEntity from '../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('course_review')
export class CourseReview extends BaseEntity {
  /* 필수 */
  @ApiProperty({
    description: '수강평 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '수강평 내용', example: '정말 좋은 강의입니다!' })
  @Column()
  content: string;

  @ApiProperty({ description: '별점 (1-5)', example: 5 })
  @Column()
  rating: number;

  /* Optional */
  @ApiProperty({
    description: '강사 답변',
    example: '감사합니다.',
    required: false,
    nullable: true,
  })
  @Column({ name: 'instructor_reply', nullable: true })
  instructorReply?: string;

  /* FK*/
  @ApiProperty({
    description: '작성자 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @ApiProperty({
    description: '강의 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'course_id', type: 'uuid', unique: true })
  courseId: string;

  /* 연관 관계 */
  @ApiProperty({ type: () => User, description: '작성자 정보' })
  @ManyToOne(() => User, (user) => user.courseReviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ type: () => Course, description: '강의 정보' })
  @ManyToOne(() => Course, (course) => course.courseReviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
