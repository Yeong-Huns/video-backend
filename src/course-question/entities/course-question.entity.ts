import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '../../common/entities/base.entity';

@Entity('course_question')
export class CourseQuestion extends BaseEntity {
  /* 필수 */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  /* Optional */
  /* FK */
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;
}
