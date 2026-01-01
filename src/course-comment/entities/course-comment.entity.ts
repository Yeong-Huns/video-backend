import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import BaseEntity from '../../common/entities/base.entity';
import { User } from 'src/user/entities/user.entity';
import { CourseQuestion } from '../../course-question/entities/course-question.entity';

@Entity('course_comment')
export class CourseComment extends BaseEntity {
  /* 필수 */
  @ApiProperty({
    description: '댓글 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '댓글 내용', example: '저도 궁금합니다.' })
  @Column()
  content: string;

  /* optional*/
  /*fk*/
  @ApiProperty({
    description: '작성자 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ApiProperty({
    description: '질문 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'question_id', type: 'uuid' })
  questionId: string;

  /* 연관 관계 */
  @ApiProperty({ type: () => User, description: '작성자 정보' })
  @ManyToOne(() => User, (user) => user.courseComments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ type: () => CourseQuestion, description: '질문 정보' })
  @ManyToOne(
    () => CourseQuestion,
    (courseQuestion) => courseQuestion.courseComments,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'question_id' })
  courseQuestion: CourseQuestion;
}
