import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RepairOrder, RepairStatus } from './entities/repair-order.entity';
import { RepairOrderItem, RepairItemType } from './entities/repair-order-item.entity';
import { RepairService } from './entities/repair-service.entity';
import { RepairStatusLog } from './entities/repair-status-log.entity';
import { Stock } from '../stocks/stock.entity';
import { StockMovement, MovementType } from '../stocks/stock-movement.entity';
import { Product } from '../products/product.entity';
import { ImportReceipt, ImportReceiptItem, ImportReceiptStatus } from '../imports/import-receipt.entity';
import { SalesInvoice, SalesInvoiceItem, InvoiceStatus } from '../sales/sales-invoice.entity';

@Injectable()
export class RepairsService {
  constructor(
    @InjectRepository(RepairOrder)
    private readonly orderRepo: Repository<RepairOrder>,
    @InjectRepository(RepairOrderItem)
    private readonly itemRepo: Repository<RepairOrderItem>,
    @InjectRepository(RepairService)
    private readonly serviceRepo: Repository<RepairService>,
    @InjectRepository(RepairStatusLog)
    private readonly logRepo: Repository<RepairStatusLog>,
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ImportReceipt)
    private readonly receiptRepo: Repository<ImportReceipt>,
    @InjectRepository(SalesInvoice)
    private readonly invoiceRepo: Repository<SalesInvoice>,
    private readonly dataSource: DataSource,
  ) {}

  // --- Repair Order Methods ---

  async findAll(query: any) {
    const { page = 1, limit = 20, search, status } = query;
    const skip = (page - 1) * limit;

    const qb = this.orderRepo.createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'items')
      .orderBy('o.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      qb.andWhere('(o.code LIKE :search OR o.customerName LIKE :search OR o.deviceName LIKE :search)', { search: `%${search}%` });
    }
    if (status) {
      qb.andWhere('o.status = :status', { status });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'logs'],
    });
    if (!order) throw new NotFoundException(`Repair Order #${id} not found`);
    return order;
  }

  async create(dto: any) {
    // Generate code if not provided
    if (!dto.code) {
      const count = await this.orderRepo.count();
      dto.code = `RO${(count + 1).toString().padStart(6, '0')}`;
    }

    // Handle potential empty strings for dates causing "Invalid Date" error
    if (dto.expectedReturnDate === '') dto.expectedReturnDate = null;
    if (dto.receivedDate === '') dto.receivedDate = undefined; // Let default GETDATE() work

    const saved = await this.orderRepo.save(dto);

    // Initial log
    await this.addLog((saved as any).id, RepairStatus.RECEIVED, 'Tiếp nhận thiết bị');
    
    return saved;
  }

  async update(id: number, dto: any) {
    const order = await this.findOne(id);
    
    if (dto.status && dto.status !== order.status) {
      await this.addLog(id, dto.status, dto.statusNote || `Chuyển trạng thái sang ${dto.status}`);
    }

    Object.assign(order, dto);
    return this.orderRepo.save(order);
  }

  // --- Service Management ---
  async addService(orderId: number, dto: any) {
    const order = await this.findOne(orderId);
    const service = await this.serviceRepo.findOne({ where: { id: dto.serviceId } });
    if (!service) throw new NotFoundException('Service not found');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const quantity = dto.quantity || 1;
      const price = dto.price || service.defaultPrice;
      const productId = service.serviceType === 'REPLACEMENT' ? (dto.productId || service.productId) : null;

      if (service.serviceType === 'REPLACEMENT' && !productId) {
        throw new BadRequestException('Product ID is required for replacement service');
      }

      const item = queryRunner.manager.create(RepairOrderItem, {
        repairOrder: order,
        serviceId: service.id,
        serviceName: service.name,
        serviceType: service.serviceType,
        productId,
        quantity,
        price,
        total: quantity * price,
      });

      // Stock check if it's a REPLACEMENT (Deducting happens on COMPLETE, but we check availability now)
      if (service.serviceType === 'REPLACEMENT' && productId) {
        const stocks = await queryRunner.manager.find(Stock, {
          where: { productId },
        });
        const available = stocks.reduce((sum, s) => sum + s.quantityRemaining, 0);
        if (available < quantity) {
          throw new BadRequestException(`Không đủ linh kiện trong kho. Hiện có: ${available}`);
        }
      }

      if (!order.items) {
        order.items = [];
      }
      order.items.push(item);

      // Update order total
      order.totalAmount = Number(order.totalAmount) + Number(item.total);
      const savedOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return savedOrder.items[savedOrder.items.length - 1];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeItem(orderId: number, itemId: number) {
    const order = await this.findOne(orderId);
    const item = await this.itemRepo.findOne({ 
      where: { 
        id: itemId, 
        repairOrder: { id: orderId } as any 
      } 
    });
    if (!item) throw new NotFoundException('Item not found in this order');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      order.totalAmount = Math.max(0, Number(order.totalAmount) - Number(item.total));
      
      if (order.items) {
        order.items = order.items.filter(i => i.id !== item.id);
      }
      
      await queryRunner.manager.save(order);
      await queryRunner.manager.remove(item);

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // --- Quick Import ---

  async quickImport(dto: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, { where: { id: dto.productId } });
      if (!product) throw new BadRequestException('Sản phẩm không tồn tại');

      const count = await queryRunner.manager.count(ImportReceipt);
      const code = `PN_QI${(count + 1).toString().padStart(6, '0')}`;

      const receipt = queryRunner.manager.create(ImportReceipt, {
        code,
        supplierId: dto.supplierId,
        importDate: new Date(),
        totalAmount: dto.quantity * dto.importPrice,
        note: dto.note || `Nhập nhanh cho sửa chữa ${dto.repairOrderId || ''}`,
        status: ImportReceiptStatus.CONFIRMED,
        type: 'QUICK_IMPORT',
        source: 'REPAIR',
        repairOrderId: dto.repairOrderId,
      } as any);

      const savedReceipt = await queryRunner.manager.save(receipt);

      const receiptItem = queryRunner.manager.create(ImportReceiptItem, {
        receiptId: savedReceipt.id,
        productId: dto.productId,
        productName: product.name,
        quantity: dto.quantity,
        importPrice: dto.importPrice,
        totalPrice: dto.quantity * dto.importPrice,
      });
      const savedReceiptItem = await queryRunner.manager.save(receiptItem);

      // Create stock
      const stock = queryRunner.manager.create(Stock, {
        productId: dto.productId,
        receiptItemId: savedReceiptItem.id,
        quantityImported: dto.quantity,
        quantityRemaining: dto.quantity,
        importPrice: dto.importPrice,
      });
      await queryRunner.manager.save(stock);

      // Movement
      const movement = queryRunner.manager.create(StockMovement, {
        productId: dto.productId,
        productName: product.name,
        referenceType: 'IMPORT_RECEIPT',
        referenceId: savedReceipt.id,
        referenceCode: savedReceipt.code,
        quantity: dto.quantity,
        movementType: MovementType.IMPORT,
      });
      await queryRunner.manager.save(movement);

      await queryRunner.commitTransaction();
      return savedReceipt;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // --- Finalization (Invoice) ---

  // --- Finalization (Complete Repair & Invoice) ---
  async completeRepair(orderId: number) {
    const order = await this.findOne(orderId);
    if (order.status === RepairStatus.COMPLETED) {
      throw new BadRequestException('Repair Order is already completed');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Sales Invoice
      const invCount = await queryRunner.manager.count(SalesInvoice);
      const invoiceCode = `HD_REPAIR${(invCount + 1).toString().padStart(6, '0')}`;

      const invoice = queryRunner.manager.create(SalesInvoice, {
        code: invoiceCode,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalAmount: order.totalAmount,
        repairOrderId: order.id,
        status: InvoiceStatus.CONFIRMED,
        note: `Hóa đơn cho phiếu sửa chữa ${order.code}`,
      } as any);

      const savedInvoice = await queryRunner.manager.save(invoice);

      // 2. Process Items (Invoice Mapping & Stock Deduction)
      for (const item of order.items || []) {
        // Create Invoice Item
        const invItem = queryRunner.manager.create(SalesInvoiceItem, {
          invoiceId: savedInvoice.id,
          productId: item.productId,
          productName: item.serviceName,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        } as any);
        await queryRunner.manager.save(invItem);

        // Deduct Stock if REPLACEMENT
        if (item.serviceType === 'REPLACEMENT' && item.productId) {
          let remainingToDeduct = item.quantity;
          const stocks = await queryRunner.manager.find(Stock, {
            where: { productId: item.productId },
            order: { createdAt: 'ASC' }, // FIFO
          });

          for (const stock of stocks) {
            if (remainingToDeduct <= 0) break;
            if (stock.quantityRemaining <= 0) continue;

            const deduct = Math.min(stock.quantityRemaining, remainingToDeduct);
            stock.quantityRemaining -= deduct;
            remainingToDeduct -= deduct;
            await queryRunner.manager.save(stock);
          }

          if (remainingToDeduct > 0) {
            throw new BadRequestException(`Cạn kho linh kiện ${item.serviceName} trong quá trình hoàn tất (thiếu ${remainingToDeduct})`);
          }

          // Stock Movement Log
          const movement = queryRunner.manager.create(StockMovement, {
            productId: item.productId,
            productName: item.serviceName,
            referenceType: 'REPAIR_ORDER',
            referenceId: order.id,
            referenceCode: order.code,
            quantity: -item.quantity,
            movementType: MovementType.REPAIR_OUT,
          });
          await queryRunner.manager.save(movement);
        }
      }

      // 3. Finalize Order
      order.status = RepairStatus.COMPLETED;
      await queryRunner.manager.save(order);
      await this.addLog_with_manager(queryRunner.manager, order.id, RepairStatus.COMPLETED, `Sửa chữa hoàn tất - Đã tạo hóa đơn ${invoiceCode}`);

      await queryRunner.commitTransaction();
      return { success: true, invoiceCode };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // --- Helper Methods ---
  private async addLog(repairOrderId: number, status: RepairStatus, note: string) {
    const repairOrder = await this.findOne(repairOrderId);
    const log = this.logRepo.create({
      id: repairOrderId,
      repairOrder: repairOrder,
      status,
      note,
    });
    return this.logRepo.save(log);
  }

  private async addLog_with_manager(manager: any, repairOrderId: number, status: RepairStatus, note: string) {
    const repairOrder = await manager.findOne(RepairOrder, { where: { id: repairOrderId } });
    const log = manager.create(RepairStatusLog, {
      repairOrder: repairOrder,
      status,
      note,
    });
    await manager.save(log);
  }

  // --- Standard Services ---

  async findAllServices() {
    return this.serviceRepo.find({ order: { name: 'ASC' } });
  }

  async createService(dto: any) {
    const service = this.serviceRepo.create(dto);
    return this.serviceRepo.save(service);
  }
}
