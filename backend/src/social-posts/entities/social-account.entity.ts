import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('social_accounts')
export class SocialAccount {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'nvarchar', length: 50 })
  platform: string; // facebook | zalo

  @Column({ name: 'page_name', type: 'nvarchar', length: 255 })
  pageName: string;

  @Column({ name: 'page_id', type: 'nvarchar', length: 255 })
  pageId: string;

  @Column({ name: 'access_token', type: 'nvarchar', length: 'MAX' })
  accessToken: string;

  @Column({ name: 'api_url', type: 'nvarchar', length: 500, nullable: true })
  apiUrl: string;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
