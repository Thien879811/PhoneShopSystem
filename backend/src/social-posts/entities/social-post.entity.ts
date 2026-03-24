import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';

export enum PostStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  POSTING = 'POSTING',
  POSTED = 'POSTED',
  FAILED = 'FAILED',
}

@Entity('social_posts')
export class SocialPost {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'nvarchar', length: 255 })
  title: string;

  @Column({ type: 'nvarchar', length: 'MAX' })
  content: string;

  @Column({ type: 'nvarchar', length: 50, default: PostStatus.DRAFT })
  status: PostStatus;

  @Column({ name: 'scheduled_time', type: 'datetime', nullable: true })
  scheduledTime: Date | null;

  @Column({ name: 'is_repeated', type: 'bit', default: 0 })
  isRepeated: boolean;

  @Column({ name: 'repeat_interval', type: 'int', default: 0 })
  repeatInterval: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  // Relations are loaded via query builder / find options
  images: any[];
  platforms: any[];
}
