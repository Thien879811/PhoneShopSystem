import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { RepairOrderItem } from './repair-order-item.entity';
import { RepairStatusLog } from './repair-status-log.entity';

export enum RepairStatus {
  RECEIVED = 'RECEIVED',
  REPAIRING = 'REPAIRING',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity('repair_orders')
export class RepairOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'customer_id', nullable: true })
  customerId: number;

  @Column({ name: 'customer_name', nullable: true })
  customerName: string;

  @Column({ name: 'customer_phone', nullable: true })
  customerPhone: string;

  @Column({ name: 'device_name' })
  deviceName: string;

  @Column({ nullable: true })
  imei: string;

  @Column({ name: 'issue_description', type: 'nvarchar', length: 'MAX', nullable: true })
  issueDescription: string;

  @Column({ name: 'received_date', type: 'datetime', default: () => 'GETDATE()' })
  receivedDate: Date;

  @Column({ name: 'expected_return_date', type: 'datetime', nullable: true })
  expectedReturnDate: Date;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'nvarchar', length: 50, default: RepairStatus.RECEIVED })
  status: RepairStatus;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => RepairOrderItem, (item) => item.repairOrder, { cascade: true })
  items: RepairOrderItem[];

  @OneToMany(() => RepairStatusLog, (log) => log.repairOrder, { cascade: true })
  logs: RepairStatusLog[];
}
