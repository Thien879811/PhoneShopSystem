import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Product } from '../products/product.entity';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  origin: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Product, (product) => product.brandRel)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;
}
