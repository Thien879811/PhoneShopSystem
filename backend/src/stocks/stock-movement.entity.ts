import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum MovementType {
  IMPORT = 'IMPORT',
  SALE = 'SALE',
  RETURN = 'RETURN',
  ADJUST = 'ADJUST',
  TRANSFER = 'TRANSFER',
  REPAIR_OUT = 'REPAIR_OUT',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @Column({ name: 'product_name', type: 'nvarchar', length: 255, nullable: true })
  productName: string;

  @Column({ name: 'reference_type', type: 'nvarchar', length: 50 })
  referenceType: string; // 'IMPORT_RECEIPT', 'SALES_INVOICE', etc.

  @Column({ name: 'reference_id', type: 'int' })
  referenceId: number;

  @Column({ name: 'reference_code', type: 'nvarchar', length: 50, nullable: true })
  referenceCode: string;

  @Column({ type: 'int' })
  quantity: number; // positive = in, negative = out

  @Column({ name: 'movement_type', type: 'nvarchar', length: 20 })
  movementType: MovementType;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
