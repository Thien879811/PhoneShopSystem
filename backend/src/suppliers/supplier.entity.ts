import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  email: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  address: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
