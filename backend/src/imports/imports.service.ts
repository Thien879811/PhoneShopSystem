import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ImportReceipt, ImportReceiptItem, ImportReceiptStatus } from './import-receipt.entity';
import { Stock } from '../stocks/stock.entity';
import { StockMovement, MovementType } from '../stocks/stock-movement.entity';
import { ProductImei, ImeiStatus } from '../imei/product-imei.entity';
import { Product } from '../products/product.entity';
import { CreateImportReceiptDto } from './dto/create-import-receipt.dto';

@Injectable()
export class ImportsService {
  constructor(
    @InjectRepository(ImportReceipt)
    private readonly receiptRepo: Repository<ImportReceipt>,
    @InjectRepository(ImportReceiptItem)
    private readonly itemRepo: Repository<ImportReceiptItem>,
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
    @InjectRepository(ProductImei)
    private readonly imeiRepo: Repository<ProductImei>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: any) {
    const { page = 1, limit = 20, search, status } = query;
    const skip = (page - 1) * limit;

    const qb = this.receiptRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.supplier', 'supplier')
      .leftJoinAndSelect('r.items', 'items')
      .orderBy('r.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      qb.andWhere('r.code LIKE :search', { search: `%${search}%` });
    }
    if (status) {
      qb.andWhere('r.status = :status', { status });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const receipt = await this.receiptRepo.findOne({
      where: { id },
      relations: ['supplier', 'items'],
    });
    if (!receipt) throw new NotFoundException(`Import Receipt #${id} not found`);
    return receipt;
  }

  async create(dto: CreateImportReceiptDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create receipt
      let totalAmount = 0;
      const items: ImportReceiptItem[] = [];

      for (const itemDto of dto.items) {
        const product = await this.productRepo.findOne({ where: { id: itemDto.productId } });
        if (!product) throw new BadRequestException(`Product #${itemDto.productId} not found`);

        const totalPrice = itemDto.quantity * itemDto.importPrice;
        totalAmount += totalPrice;

        const item = queryRunner.manager.create(ImportReceiptItem, {
          productId: itemDto.productId,
          productName: product.name,
          quantity: itemDto.quantity,
          importPrice: itemDto.importPrice,
          totalPrice,
        });
        items.push(item);
      }

      const receipt = queryRunner.manager.create(ImportReceipt, {
        code: dto.code,
        supplierId: dto.supplierId || null,
        importDate: dto.importDate ? new Date(dto.importDate) : new Date(),
        totalAmount,
        note: dto.note,
        status: ImportReceiptStatus.CONFIRMED,
      } as any);
      receipt.items = items;

      const savedReceipt = await queryRunner.manager.save(receipt);

      // 2. Create stock entries & movements for each item
      for (let i = 0; i < savedReceipt.items.length; i++) {
        const savedItem = savedReceipt.items[i];
        const itemDto = dto.items[i];

        // Create stock
        const stock = queryRunner.manager.create(Stock, {
          productId: savedItem.productId,
          receiptItemId: savedItem.id,
          quantityImported: savedItem.quantity,
          quantityRemaining: savedItem.quantity,
          importPrice: savedItem.importPrice,
        });
        const savedStock = await queryRunner.manager.save(stock);

        // Create movement
        const movement = queryRunner.manager.create(StockMovement, {
          productId: savedItem.productId,
          productName: savedItem.productName,
          referenceType: 'IMPORT_RECEIPT',
          referenceId: savedReceipt.id,
          referenceCode: savedReceipt.code,
          quantity: savedItem.quantity,
          movementType: MovementType.IMPORT,
        });
        await queryRunner.manager.save(movement);

        // Create IMEI records if provided
        if (itemDto.imeis && itemDto.imeis.length > 0) {
          for (const imeiValue of itemDto.imeis) {
            const imei = queryRunner.manager.create(ProductImei, {
              productId: savedItem.productId,
              stockId: savedStock.id,
              imei: imeiValue,
              status: ImeiStatus.IN_STOCK,
            });
            await queryRunner.manager.save(imei);
          }
        }
      }

      await queryRunner.commitTransaction();
      return savedReceipt;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const receipt = await this.findOne(id);
    if (receipt.status === ImportReceiptStatus.CONFIRMED) {
      throw new BadRequestException('Cannot delete a confirmed receipt');
    }
    await this.receiptRepo.remove(receipt);
    return { success: true };
  }
}
