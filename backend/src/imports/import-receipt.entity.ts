import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Supplier } from '../suppliers/supplier.entity';

export enum ImportReceiptStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity('import_receipts')
export class ImportReceipt {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'nvarchar', length: 50, unique: true })
  code: string;

  @Column({ name: 'supplier_id', type: 'int', nullable: true })
  supplierId: number;

  @ManyToOne(() => Supplier, { nullable: true, eager: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ name: 'import_date', type: 'datetime' })
  importDate: Date;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  note: string;

  @Column({ type: 'nvarchar', length: 20, default: ImportReceiptStatus.DRAFT })
  status: ImportReceiptStatus;

  @Column({ name: 'type', type: 'nvarchar', length: 50, default: 'NORMAL' })
  type: string;

  @Column({ name: 'source', type: 'nvarchar', length: 50, nullable: true })
  source: string;

  @Column({ name: 'repair_order_id', type: 'int', nullable: true })
  repairOrderId: number;

  @OneToMany(() => ImportReceiptItem, (item) => item.receipt, { cascade: true })
  items: ImportReceiptItem[];

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}

@Entity('import_receipt_items')
export class ImportReceiptItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'receipt_id', type: 'int' })
  receiptId: number;

  @ManyToOne(() => ImportReceipt, (receipt) => receipt.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receipt_id' })
  receipt: ImportReceipt;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @Column({ name: 'product_name', type: 'nvarchar', length: 255, nullable: true })
  productName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'import_price', type: 'decimal', precision: 18, scale: 2 })
  importPrice: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 18, scale: 2 })
  totalPrice: number;
}
