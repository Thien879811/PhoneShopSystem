import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './brand.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly repo: Repository<Brand>,
  ) {}

  findAll() { return this.repo.find({ order: { name: 'ASC' } }); }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }
  create(data: any) { return this.repo.save(this.repo.create(data)); }
  update(id: number, data: any) { return this.repo.update(id, data); }
  remove(id: number) { return this.repo.delete(id); }
}
