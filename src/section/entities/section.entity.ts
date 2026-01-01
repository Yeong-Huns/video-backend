import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '../../common/entities/base.entity';

@Entity()
export class Section extends BaseEntity {
  /* 필수 필드 */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  order: number;

  /* Optional 필드 */
  @Column({ nullable: true })
  description?: string;

  /* 외래키 */
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;
}
