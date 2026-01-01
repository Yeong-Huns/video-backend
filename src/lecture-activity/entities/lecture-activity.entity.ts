import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '../../common/entities/base.entity';

@Entity('lecture_activity')
export class LectureActivity extends BaseEntity {
  /* 필수 */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  progress: number;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @Column({
    name: 'last_watched_at',
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  lastWatchedAt: Date;

  /* optional*/
  /* fk*/
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'lecture_id', type: 'uuid', unique: true })
  lectureId: string;
}
