import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../products/product.entity';
import { Stock } from '../stocks/stock.entity';

export enum ImeiStatus {
  IN_STOCK = 'IN_STOCK',
  SOLD = 'SOLD',
  RETURNED = 'RETURNED',
  WARRANTY = 'WARRANTY',
}

@Entity('product_imeis')
export class ProductImei {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'stock_id', type: 'int', nullable: true })
  stockId: number;

  @ManyToOne(() => Stock, { nullable: true })
  @JoinColumn({ name: 'stock_id' })
  stock: Stock;

  @Column({ type: 'nvarchar', length: 50, unique: true })
  imei: string;

  @Column({ type: 'nvarchar', length: 20, default: ImeiStatus.IN_STOCK })
  status: ImeiStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
