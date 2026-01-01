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
import { Lecture } from '../../lecture/entities/lecture.entity';

@Entity('lecture_activity')
export class LectureActivity extends BaseEntity {
  /* 필수 */
  @ApiProperty({
    description: '강의 활동 로그 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '진행률 (0-100)', example: 50, default: 0 })
  @Column({ default: 0 })
  progress: number;

  @ApiProperty({ description: '완료 여부', example: false, default: false })
  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @ApiProperty({ description: '마지막 시청 시간' })
  @Column({
    name: 'last_watched_at',
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  lastWatchedAt: Date;

  /* optional*/
  /* fk*/
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
  @Column({ name: 'lecture_id', type: 'uuid', unique: true })
  lectureId: string;

  /* 연관관계 */
  @ApiProperty({ type: () => User, description: '사용자 정보' })
  @ManyToOne(() => User, (user) => user.lectureActivities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ type: () => Lecture, description: '강의 정보' })
  @ManyToOne(() => Lecture, (lecture) => lecture.lectureActivities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lecture_id' })
  lecture: Lecture;
}
