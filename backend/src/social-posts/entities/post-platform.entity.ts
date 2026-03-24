import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SocialPost } from './social-post.entity';
import { SocialAccount } from './social-account.entity';

@Entity('post_platforms')
export class PostPlatform {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'post_id' })
  postId: number;

  @Column({ name: 'account_id' })
  accountId: number;

  @Column({ type: 'nvarchar', length: 50, default: 'PENDING' })
  status: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  response: string;

  @Column({ name: 'posted_at', type: 'datetime', nullable: true })
  postedAt: Date;

  @ManyToOne(() => SocialPost, (post) => post.platforms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: SocialPost;

  @ManyToOne(() => SocialAccount, { eager: true })
  @JoinColumn({ name: 'account_id' })
  account: SocialAccount;
}
