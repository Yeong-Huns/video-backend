import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Account {
  @ApiProperty({
    description: '계정 ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '계정 타입', example: 'oauth' })
  @Column({ type: 'varchar' })
  type: string;

  @ApiProperty({
    description: '제공자 (Provider)',
    example: 'google',
  })
  @Column({ type: 'varchar', unique: true })
  provider: string;

  @ApiProperty({ description: '제공자측 계정 ID', example: '1234567890' })
  @Column({ name: 'provider_account_id', type: 'varchar', unique: true })
  providerAccountId: string;

  @ApiProperty({
    description: '리프레시 토큰',
    required: false,
    nullable: true,
  })
  @Column({ name: 'refresh_token', nullable: true, type: 'text' })
  refreshToken: string | null;

  @ApiProperty({ description: '액세스 토큰', required: false, nullable: true })
  @Column({ name: 'access_token', nullable: true, type: 'text' })
  accessToken: string | null;

  @ApiProperty({
    description: '토큰 만료 시간',
    required: false,
    nullable: true,
  })
  @Column({ name: 'expires_at', nullable: true, type: 'datetime' })
  expiresAt: Date | null;

  @ApiProperty({
    description: '토큰 타입',
    required: false,
    nullable: true,
    example: 'Bearer',
  })
  @Column({ name: 'token_type', nullable: true, type: 'varchar' })
  tokenType: string | null;

  @ApiProperty({
    description: '권한 범위 (Scope)',
    required: false,
    nullable: true,
  })
  @Column({ nullable: true, type: 'varchar' })
  scope: string | null;

  @ApiProperty({ description: 'ID 토큰', required: false, nullable: true })
  @Column({ name: 'id_token', nullable: true, type: 'text' })
  idToken: string | null;

  @ApiProperty({
    description: '사용자 ID',
    example: '16a22356-52a7-4a30-88a6-9c31bef64d59',
  })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ApiProperty({ type: () => User, description: '사용자 정보' })
  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
