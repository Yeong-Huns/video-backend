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

@Entity('course_enrollment')
export class CourseEnrollment extends BaseEntity {
  /*필수*/
  @ApiProperty({
    description: '수강 신청 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '수강 신청 일시',
    example: '2024-01-01T00:00:00Z',
  })
  @Column({
    name: 'enrollment_date',
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  enrollmentDate: Date;

  /*fk*/
  @ApiProperty({
    description: '사용자 ID (UUID)',
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
  @ApiProperty({ type: () => User, description: '수강생 정보' })
  @ManyToOne(() => User, (user) => user.courseEnrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ type: () => Course, description: '강의 정보' })
  @ManyToOne(() => Course, (course) => course.courseEnrollments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
