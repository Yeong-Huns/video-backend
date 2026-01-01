import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../role/entities/role.entity';
import { Account } from '../../account/entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Course } from '../../course/entities/course.entity';
import { CourseEnrollment } from '../../course-enrollment/entities/course-enrollment.entity';
import { CourseReview } from '../../course-review/entities/course-review.entity';
import { CourseQuestion } from '../../course-question/entities/course-question.entity';
import { CourseComment } from '../../course-comment/entities/course-comment.entity';
import { LectureActivity } from '../../lecture-activity/entities/lecture-activity.entity';

@Entity({ name: 'user' })
export class User {
  @ApiProperty({
    description: '사용자 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
    required: false,
    nullable: true,
  })
  @Column({ name: 'name', nullable: true, type: 'varchar' })
  name: string | null;

  @ApiProperty({
    description: '이메일 주소',
    example: 'user@example.com',
    required: false,
    nullable: true,
  })
  @Column({ unique: true, nullable: true, type: 'varchar' })
  email: string | null;

  @ApiProperty({
    description: '이메일 인증 시간',
    required: false,
    nullable: true,
  })
  @Column({ name: 'email_verified', nullable: true, type: 'datetime' })
  emailVerified: Date | null;

  @ApiProperty({
    description: '해싱된 비밀번호',
    required: false,
    nullable: true,
  })
  @Column({ name: 'hashed_password', nullable: true, type: 'text' })
  hashedPassword: string | null;

  @ApiProperty({
    description: '사용자 프로필 이미지 URL',
    required: false,
    nullable: true,
  })
  @Column({ nullable: true, type: 'text' })
  image: string | null;

  @ApiProperty({
    description: '권한 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @ApiProperty({ type: () => Role, description: '사용자 권한 정보' })
  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ApiProperty({ type: () => [Account], description: '연결된 계정 목록' })
  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @ApiProperty({ type: () => [Course], description: '개설한 강의 목록' })
  @OneToMany(() => Course, (course) => course.instructor)
  courses: Course[];

  @ApiProperty({
    type: () => [CourseEnrollment],
    description: '수강 신청 목록',
  })
  @OneToMany(
    () => CourseEnrollment,
    (courseEnrollment) => courseEnrollment.user,
  )
  courseEnrollments: CourseEnrollment[];

  @ApiProperty({
    type: () => [CourseReview],
    description: '작성한 강의 리뷰 목록',
  })
  @OneToMany(() => CourseReview, (courseReview) => courseReview.user)
  courseReviews: CourseReview[];

  @ApiProperty({
    type: () => [CourseQuestion],
    description: '작성한 강의 질문 목록',
  })
  @OneToMany(() => CourseQuestion, (CourseQuestion) => CourseQuestion.user)
  courseQuestions: CourseQuestion[];

  @ApiProperty({ type: () => [CourseComment], description: '작성한 댓글 목록' })
  @OneToMany(() => CourseComment, (courseComment) => courseComment.user)
  courseComments: CourseComment[];

  @ApiProperty({ type: () => [LectureActivity], description: '강의 활동 로그' })
  @OneToMany(() => LectureActivity, (lectureActivity) => lectureActivity.user)
  lectureActivities: LectureActivity[];
}
