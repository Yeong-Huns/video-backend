import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import BaseEntity from '../../common/entities/base.entity';

@Entity()
export class Course extends BaseEntity {
  /* 필수 필드 */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column({ default: 0 })
  price: number;

  @Column({ default: 'BEGINNER' })
  level: string;

  @Column({ default: 'DRAFT' })
  status: string;

  /* optional 필드 */
  @Column({ name: 'short_description', nullable: true })
  shortDescription?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  thumbnail?: string;

  @Column({ nullable: true })
  discountPrice?: number;

  /* 외래키 */
  @Column({ name: 'instructor_id', type: 'uuid' })
  instructorId: string;
}
