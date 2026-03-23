import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findAll() { return this.repo.find({ order: { name: 'ASC' } }); }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }
  create(data: any) { return this.repo.save(this.repo.create(data)); }
  update(id: number, data: any) { return this.repo.update(id, data); }
  remove(id: number) { return this.repo.delete(id); }
}
