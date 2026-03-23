import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('repair_services')
export class RepairService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'service_type', type: 'nvarchar', length: 20, nullable: true })
  serviceType: 'REPAIR' | 'REPLACEMENT';

  @Column({ name: 'default_price', type: 'decimal', precision: 18, scale: 2, default: 0 })
  defaultPrice: number;

  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  description: string;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
