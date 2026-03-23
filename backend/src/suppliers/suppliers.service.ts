import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Supplier } from './supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
  ) {}

  async findAll(query: any) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) where.name = Like(`%${search}%`);

    const [data, total] = await this.supplierRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const supplier = await this.supplierRepo.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException(`Supplier #${id} not found`);
    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    const supplier = this.supplierRepo.create(dto);
    return this.supplierRepo.save(supplier);
  }

  async update(id: number, dto: UpdateSupplierDto) {
    const supplier = await this.findOne(id);
    Object.assign(supplier, dto);
    return this.supplierRepo.save(supplier);
  }

  async remove(id: number) {
    const supplier = await this.findOne(id);
    await this.supplierRepo.remove(supplier);
    return { success: true };
  }
}
