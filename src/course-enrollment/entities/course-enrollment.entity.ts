import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '../../common/entities/base.entity';

@Entity('course_enrollment')
export class CourseEnrollment extends BaseEntity {
  /*필수*/
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'enrollment_date',
    default: () => 'CURRENT_TIMESTAMP',
    type: 'timestamp',
  })
  enrollmentDate: Date;

  /*fk*/
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'course_id', type: 'uuid', unique: true })
  courseId: string;
}
