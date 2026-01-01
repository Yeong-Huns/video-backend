import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '../../common/entities/base.entity';

@Entity('course_category')
export class CourseCategory extends BaseEntity {
  /* 필수 */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  /* optional */
  @Column({ nullable: true })
  description?: string;
}
