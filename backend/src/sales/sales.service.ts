import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SalesInvoice, SalesInvoiceItem, InvoiceStatus } from './sales-invoice.entity';
import { Stock } from '../stocks/stock.entity';
import { StockMovement, MovementType } from '../stocks/stock-movement.entity';
import { ProductImei, ImeiStatus } from '../imei/product-imei.entity';
import { Product } from '../products/product.entity';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(SalesInvoice)
    private readonly invoiceRepo: Repository<SalesInvoice>,
    @InjectRepository(SalesInvoiceItem)
    private readonly invoiceItemRepo: Repository<SalesInvoiceItem>,
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

    const qb = this.invoiceRepo.createQueryBuilder('inv')
      .leftJoinAndSelect('inv.items', 'items')
      .orderBy('inv.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      qb.andWhere('(inv.code LIKE :search OR inv.customerName LIKE :search)', { search: `%${search}%` });
    }
    if (status) {
      qb.andWhere('inv.status = :status', { status });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!invoice) throw new NotFoundException(`Sales Invoice #${id} not found`);
    return invoice;
  }

  /**
   * Create sales invoice with FIFO stock deduction
   */
  async create(dto: CreateSalesInvoiceDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const items: SalesInvoiceItem[] = [];

      for (const itemDto of dto.items) {
        const product = await this.productRepo.findOne({ where: { id: itemDto.productId } });
        if (!product) throw new BadRequestException(`Product #${itemDto.productId} not found`);

        const totalPrice = itemDto.quantity * itemDto.price;
        totalAmount += totalPrice;

        const item = queryRunner.manager.create(SalesInvoiceItem, {
          productId: itemDto.productId,
          productName: product.name,
          quantity: itemDto.quantity,
          price: itemDto.price,
          total: totalPrice,
        });
        items.push(item);
      }

      const invoice = queryRunner.manager.create(SalesInvoice, {
        code: dto.code,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        totalAmount,
        note: dto.note,
        status: InvoiceStatus.CONFIRMED,
        items,
      });

      const savedInvoice = await queryRunner.manager.save(invoice);

      // FIFO stock deduction for each item
      for (let i = 0; i < savedInvoice.items.length; i++) {
        const savedItem = savedInvoice.items[i];
        const itemDto = dto.items[i];

        let remainingToDeduct = savedItem.quantity;

        // Get stocks ordered by created_at ASC (FIFO)
        const stocks = await queryRunner.manager.find(Stock, {
          where: { productId: savedItem.productId },
          order: { createdAt: 'ASC' },
        });

        const availableTotal = stocks.reduce((sum, s) => sum + s.quantityRemaining, 0);
        if (availableTotal < remainingToDeduct) {
          throw new BadRequestException(
            `Insufficient stock for "${savedItem.productName}". Available: ${availableTotal}, Requested: ${remainingToDeduct}`,
          );
        }

        // Deduct using FIFO
        for (const stock of stocks) {
          if (remainingToDeduct <= 0) break;
          if (stock.quantityRemaining <= 0) continue;

          const deduct = Math.min(stock.quantityRemaining, remainingToDeduct);
          stock.quantityRemaining -= deduct;
          remainingToDeduct -= deduct;

          await queryRunner.manager.save(stock);
        }

        // Create movement log
        const movement = queryRunner.manager.create(StockMovement, {
          productId: savedItem.productId,
          productName: savedItem.productName,
          referenceType: 'SALES_INVOICE',
          referenceId: savedInvoice.id,
          referenceCode: savedInvoice.code,
          quantity: -savedItem.quantity,
          movementType: MovementType.SALE,
        });
        await queryRunner.manager.save(movement);

        // Update IMEI status if provided
        if (itemDto.imeis && itemDto.imeis.length > 0) {
          for (const imeiValue of itemDto.imeis) {
            const imei = await queryRunner.manager.findOne(ProductImei, {
              where: { imei: imeiValue, productId: savedItem.productId },
            });
            if (imei) {
              imei.status = ImeiStatus.SOLD;
              await queryRunner.manager.save(imei);
            }
          }
        }
      }

      await queryRunner.commitTransaction();
      return savedInvoice;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const invoice = await this.findOne(id);
    if (invoice.status === InvoiceStatus.CONFIRMED) {
      throw new BadRequestException('Cannot delete a confirmed invoice');
    }
    await this.invoiceRepo.remove(invoice);
    return { success: true };
  }
}
