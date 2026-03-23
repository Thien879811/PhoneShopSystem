import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum InventoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'product_code', type: 'nvarchar', length: 50 })
  productCode: string;

  @Column({ name: 'product_name', type: 'nvarchar', length: 255 })
  productName: string;

  @Column({ type: 'nvarchar', length: 100 })
  category: string;

  @Column({ type: 'nvarchar', length: 100 })
  brand: string;

  @Column({ name: 'import_price', type: 'decimal', precision: 18, scale: 2 })
  importPrice: number;

  @Column({ name: 'sell_price', type: 'decimal', precision: 18, scale: 2 })
  sellPrice: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'min_quantity', type: 'int' })
  minQuantity: number;

  @Column({ name: 'warehouse_location', type: 'nvarchar', length: 100 })
  warehouseLocation: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  imei?: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  description: string;

  @Column({ type: 'nvarchar', length: 20, default: InventoryStatus.ACTIVE })
  status: InventoryStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  // Custom calculated field pattern commonly used
  get lowStock(): boolean {
    return this.quantity <= this.minQuantity;
  }
}
