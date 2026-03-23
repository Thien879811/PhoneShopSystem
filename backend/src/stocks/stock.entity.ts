import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../products/product.entity';
import { ImportReceiptItem } from '../imports/import-receipt.entity';

@Entity('stocks')
export class Stock {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'receipt_item_id', type: 'int', nullable: true })
  receiptItemId: number;

  @ManyToOne(() => ImportReceiptItem, { nullable: true })
  @JoinColumn({ name: 'receipt_item_id' })
  receiptItem: ImportReceiptItem;

  @Column({ name: 'quantity_imported', type: 'int' })
  quantityImported: number;

  @Column({ name: 'quantity_remaining', type: 'int' })
  quantityRemaining: number;

  @Column({ name: 'import_price', type: 'decimal', precision: 18, scale: 2 })
  importPrice: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
