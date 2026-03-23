import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Entity('sales_invoices')
export class SalesInvoice {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'nvarchar', length: 50, unique: true })
  code: string;

  @Column({ name: 'customer_name', type: 'nvarchar', length: 255, nullable: true })
  customerName: string;

  @Column({ name: 'customer_phone', type: 'nvarchar', length: 50, nullable: true })
  customerPhone: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  note: string;

  @Column({ type: 'nvarchar', length: 20, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @OneToMany(() => SalesInvoiceItem, (item) => item.invoice, { cascade: true })
  items: SalesInvoiceItem[];

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}

@Entity('sales_invoice_items')
export class SalesInvoiceItem {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'invoice_id', type: 'int' })
  invoiceId: number;

  @ManyToOne(() => SalesInvoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: SalesInvoice;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @Column({ name: 'product_name', type: 'nvarchar', length: 255, nullable: true })
  productName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  total: number;
}
