import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../categories/category.entity';
import { Brand } from '../brands/brand.entity';

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'nvarchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  // Link to new entities
  @ManyToOne(() => Category, (cat) => cat.products, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  categoryRel: Category;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Brand, (brand) => brand.products, { nullable: true })
  @JoinColumn({ name: 'brandId' })
  brandRel: Brand;

  @Column({ nullable: true })
  brandId: number;

  // For compatibility, we'll keep the string fields but they will be optional or mirroring names
  @Column({ type: 'nvarchar', length: 100, nullable: true })
  category: string; 

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  brand: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  unit: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  barcode: string;

  @Column({ name: 'sell_price', type: 'decimal', precision: 18, scale: 2, default: 0 })
  sellPrice: number;

  @Column({ name: 'min_stock', type: 'int', default: 0 })
  minStock: number;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'nvarchar', length: 20, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
