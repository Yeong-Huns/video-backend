import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '../../common/entities/base.entity';

@Entity('course_review')
export class CourseReview extends BaseEntity {
  /* 필수 */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  rating: number;

  /* Optional */
  @Column({ name: 'instructor_reply', nullable: true })
  instructorReply?: string;

  /* FK*/
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'course_id', type: 'uuid', unique: true })
  courseId: string;
}
