import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import BaseEntity from '../../common/entities/base.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('course_category')
export class CourseCategory extends BaseEntity {
  /* 필수 */
  @ApiProperty({
    description: '카테고리 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '카테고리 이름', example: '웹 개발' })
  @Column()
  name: string;

  @ApiProperty({ description: '카테고리 슬러그', example: 'web-development' })
  @Column({ unique: true })
  slug: string;

  /* optional */
  @ApiProperty({
    description: '카테고리 설명',
    example: '웹 개발 관련 강의 모음',
    required: false,
    nullable: true,
  })
  @Column({ nullable: true })
  description?: string;

  /* 연관관계 */
  @ApiProperty({
    type: () => [Course],
    description: '해당 카테고리의 강의 목록',
  })
  @ManyToMany(() => Course, (course) => course.courseCategories)
  courses: Course[];
}
