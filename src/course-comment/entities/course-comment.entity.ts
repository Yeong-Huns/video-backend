import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '../../common/entities/base.entity';

@Entity('course_comment')
export class CourseComment extends BaseEntity {
  /* 필수 */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  /* optional*/
  /*fk*/
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'question_id', type: 'uuid' })
  questionId: string;
}
