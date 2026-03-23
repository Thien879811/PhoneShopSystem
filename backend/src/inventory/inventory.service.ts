import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Inventory } from './inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto, UpdateQuantityDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  private mapToResponse(inventory: Inventory) {
    return {
      ...inventory,
      lowStock: inventory.quantity <= inventory.minQuantity,
    };
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search, category, brand, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.productName = Like(`%${search}%`);
      // Could also search by productCode
    }
    if (category) {
      where.category = category;
    }
    if (brand) {
      where.brand = brand;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.inventoryRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: data.map(item => this.mapToResponse(item)),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const inventory = await this.inventoryRepository.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }
    return this.mapToResponse(inventory);
  }

  async create(createInventoryDto: CreateInventoryDto) {
    if (createInventoryDto.quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const inventory = this.inventoryRepository.create(createInventoryDto);
    const savedInventory = await this.inventoryRepository.save(inventory);
    return this.mapToResponse(savedInventory);
  }

  async createBatch(createInventoryDtos: CreateInventoryDto[]) {
    for (const dto of createInventoryDtos) {
      if (dto.quantity < 0) {
        throw new BadRequestException(`Quantity for product ${dto.productName} cannot be negative`);
      }
    }

    const inventories = this.inventoryRepository.create(createInventoryDtos);
    const savedInventories = await this.inventoryRepository.save(inventories);
    return savedInventories.map(item => this.mapToResponse(item));
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    if (updateInventoryDto.quantity !== undefined && updateInventoryDto.quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const inventory = await this.inventoryRepository.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    const { lowStock, createdAt, updatedAt, id: _id, ...updateData } = updateInventoryDto as any;
    Object.assign(inventory, updateData);
    
    const savedInventory = await this.inventoryRepository.save(inventory);
    return this.mapToResponse(savedInventory);
  }

  async remove(id: number) {
    const inventory = await this.inventoryRepository.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    await this.inventoryRepository.remove(inventory);
    return { success: true, message: 'Deleted successfully' };
  }

  async updateQuantity(id: number, updateQuantityDto: UpdateQuantityDto) {
    if (updateQuantityDto.quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const inventory = await this.inventoryRepository.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    inventory.quantity = updateQuantityDto.quantity;
    const savedInventory = await this.inventoryRepository.save(inventory);
    return this.mapToResponse(savedInventory);
  }
}
