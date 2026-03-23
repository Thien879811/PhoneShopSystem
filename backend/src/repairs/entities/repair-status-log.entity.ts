import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RepairOrder, RepairStatus } from './repair-order.entity';

@Entity('repair_status_logs')
export class RepairStatusLog {
  @PrimaryGeneratedColumn()
  id: number;



  @ManyToOne(() => RepairOrder, (order) => order.logs, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'repair_order_id' })
  repairOrder: RepairOrder;

  @Column({ type: 'nvarchar', length: 50 })
  status: RepairStatus;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
