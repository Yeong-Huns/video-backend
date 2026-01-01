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
import { Section } from '../../section/entities/section.entity';
import { LectureActivity } from '../../lecture-activity/entities/lecture-activity.entity';

@Entity()
export class Lecture extends BaseEntity {
  /* 필수필드 */
  @ApiProperty({
    description: '강의(레슨) ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '강의(레슨) 제목', example: '1강. NestJS 소개' })
  @Column()
  title: string;

  @ApiProperty({ description: '강의(레슨) 순서', example: 1 })
  @Column()
  order: number;

  @ApiProperty({ description: '미리보기 여부', example: false, default: false })
  @Column({ name: 'is_preview', default: false })
  isPreview: boolean;

  /* optional */
  @ApiProperty({
    description: '강의(레슨) 재생 시간 (초)',
    example: 600,
    required: false,
    nullable: true,
  })
  @Column({ nullable: true })
  duration?: number;

  @ApiProperty({
    description: '강의(레슨) 설명',
    example: 'NestJS의 기본 개념을 알아봅니다.',
    required: false,
    nullable: true,
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: '영상 저장 정보 (JSON)',
    example: { url: 'https://example.com/video.mp4', key: 'video-key' },
    required: false,
    nullable: true,
  })
  @Column({ name: 'video_storage_info', type: 'json', nullable: true })
  videoStorageInfo: Record<string, any>;

  /* 외래키 */
  @ApiProperty({
    description: '강의 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @ApiProperty({
    description: '섹션 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'section_id', type: 'uuid' })
  sectionId: string;

  /* 연관관계 */
  @ApiProperty({ type: () => Course, description: '강의 정보' })
  @ManyToOne(() => Course, (course) => course.lectures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ApiProperty({ type: () => Section, description: '섹션 정보' })
  @ManyToOne(() => Section, (section) => section.lectures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @OneToMany(
    () => LectureActivity,
    (lectureActivity) => lectureActivity.lecture,
  )
  lectureActivities: LectureActivity[];
}
