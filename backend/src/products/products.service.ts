import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAll(query: any) {
    const { page = 1, limit = 20, search, category, brand, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) where.name = Like(`%${search}%`);
    if (category) where.category = category;
    if (brand) where.brand = brand;
    if (status) where.status = status;

    const [data, total] = await this.productRepo.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['categoryRel', 'brandRel'],
      order: { createdAt: 'DESC' },
    });

    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({ 
      where: { id },
      relations: ['categoryRel', 'brandRel']
    });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  async create(dto: CreateProductDto) {
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
    return { success: true };
  }
}
