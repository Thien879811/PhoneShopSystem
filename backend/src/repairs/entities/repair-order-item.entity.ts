import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { RepairOrder } from './repair-order.entity';

export enum RepairItemType {
  SERVICE = 'SERVICE',
  PRODUCT = 'PRODUCT',
}

@Entity('repair_order_items')
export class RepairOrderItem {
  @PrimaryGeneratedColumn()
  id: number;



  @ManyToOne(() => RepairOrder, (order) => order.items, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'repair_order_id' })
  repairOrder: RepairOrder;
  @Column({ name: 'service_id', nullable: true })
  serviceId: number;

  @Column({ name: 'service_name', type: 'nvarchar', length: 255, nullable: true })
  serviceName: string;

  @Column({ name: 'service_type', type: 'nvarchar', length: 20, nullable: true })
  serviceType: 'REPAIR' | 'REPLACEMENT';

  @Column({ name: 'product_id', nullable: true })
  productId: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
