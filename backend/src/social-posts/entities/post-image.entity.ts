import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SocialPost } from './social-post.entity';

@Entity('post_images')
export class PostImage {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'post_id' })
  postId: number;

  @Column({ name: 'image_url', type: 'nvarchar', length: 500 })
  imageUrl: string;

  @ManyToOne(() => SocialPost, (post) => post.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: SocialPost;
}
