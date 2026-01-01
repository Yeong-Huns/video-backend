import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '../../common/entities/base.entity';

@Entity()
export class Lecture extends BaseEntity {
  /* 필수필드 */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  order: number;

  @Column({ name: 'is_preview', default: false })
  isPreview: boolean;

  /* optional */
  @Column({ nullable: true })
  duration?: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'video_storage_info', type: 'json', nullable: true })
  videoStorageInfo: Record<string, any>;

  /* 외래키 */
  @Column({ name: 'section_id', type: 'uuid' })
  sectionId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;
}
