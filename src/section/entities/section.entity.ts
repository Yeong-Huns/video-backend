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
import { Course } from 'src/course/entities/course.entity';
import { Lecture } from '../../lecture/entities/lecture.entity';

@Entity()
export class Section extends BaseEntity {
  /* 필수 필드 */
  @ApiProperty({
    description: '섹션 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '섹션 제목', example: '섹션 1: 소개' })
  @Column()
  title: string;

  @ApiProperty({ description: '섹션 순서', example: 1 })
  @Column()
  order: number;

  /* Optional 필드 */
  @ApiProperty({
    description: '섹션 설명',
    example: '이 섹션에서는 ...',
    required: false,
    nullable: true,
  })
  @Column({ nullable: true })
  description?: string;

  /* 외래키 */
  @ApiProperty({
    description: '강의 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  /* 연관관계 */
  @ApiProperty({ type: () => Course, description: '강의 정보' })
  @ManyToOne(() => Course, (course) => course.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ApiProperty({ type: () => [Lecture], description: '강의 목록' })
  @OneToMany(() => Lecture, (lecture) => lecture.section)
  lectures: Lecture[];
}
