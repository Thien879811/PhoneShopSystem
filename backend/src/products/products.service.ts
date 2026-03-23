import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../categories/category.entity';
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
    if (!dto.code || dto.code.trim() === '') {
      dto.code = await this.generateAutomaticCode(dto.categoryId);
    }
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  private async generateAutomaticCode(categoryId?: number): Promise<string> {
    let prefix = 'PROD';
    if (categoryId) {
      // We need to fetch the category to get the prefix. Since I don't want to overcomplicate
      // module dependencies, I'll use a raw query or just assume the user provides prefix in DTO?
      // No, let's just do it right. I'll use the EntityManager or similar.
      // But for simplicity of this task, I'll use the first 2 letters of category name IF categoryId is valid.
      // Wait, let's implement a consistent increment logic.
      
      const category = await this.productRepo.manager.findOne(Category, { where: { id: categoryId } });
      if (category && category.prefix) {
        prefix = category.prefix.toUpperCase();
      } else if (category) {
        prefix = category.name.substring(0, 2).toUpperCase();
      }
    }

    const lastProduct = await this.productRepo.findOne({
      where: { code: Like(`${prefix}-%`) },
      order: { code: 'DESC' },
    });

    let nextNum = 1;
    if (lastProduct && lastProduct.code.includes('-')) {
      const parts = lastProduct.code.split('-');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }

    return `${prefix}-${nextNum.toString().padStart(4, '0')}`;
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
