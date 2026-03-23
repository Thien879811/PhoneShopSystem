import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './stock.entity';
import { StockMovement } from './stock-movement.entity';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
  ) {}

  /** Get stock overview — aggregated by product */
  async getStockSummary(query: any) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const qb = this.stockRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.product', 'product')
      .select('s.product_id', 'productId')
      .addSelect('product.code', 'productCode')
      .addSelect('product.name', 'productName')
      .addSelect('product.category', 'category')
      .addSelect('product.brand', 'brand')
      .addSelect('product.min_stock', 'minStock')
      .addSelect('SUM(s.quantity_remaining)', 'totalRemaining')
      .addSelect('SUM(s.quantity_imported)', 'totalImported')
      .groupBy('s.product_id')
      .addGroupBy('product.code')
      .addGroupBy('product.name')
      .addGroupBy('product.category')
      .addGroupBy('product.brand')
      .addGroupBy('product.min_stock');

    if (search) {
      qb.andWhere('product.name LIKE :search', { search: `%${search}%` });
    }

    const totalQuery = qb.clone();
    const total = (await totalQuery.getRawMany()).length;

    const data = await qb.offset(skip).limit(limit).getRawMany();

    return {
      data: data.map(row => ({
        productId: row.productId,
        productCode: row.productCode,
        productName: row.productName,
        category: row.category,
        brand: row.brand,
        minStock: row.minStock,
        totalRemaining: Number(row.totalRemaining),
        totalImported: Number(row.totalImported),
        lowStock: Number(row.totalRemaining) <= Number(row.minStock || 0),
      })),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Get detailed stock entries for a product */
  async getStockByProduct(productId: number) {
    return this.stockRepo.find({
      where: { productId },
      relations: ['receiptItem'],
      order: { createdAt: 'ASC' },
    });
  }

  /** Get all stock movements */
  async getMovements(query: any) {
    const { page = 1, limit = 30, productId, movementType } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (movementType) where.movementType = movementType;

    const [data, total] = await this.movementRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
  }

  /** Dashboard stats */
  async getDashboardStats() {
    const totalProducts = await this.stockRepo.createQueryBuilder('s')
      .select('COUNT(DISTINCT s.product_id)', 'count')
      .getRawOne();

    const totalStock = await this.stockRepo.createQueryBuilder('s')
      .select('SUM(s.quantity_remaining)', 'total')
      .getRawOne();

    const lowStockProducts = await this.stockRepo.createQueryBuilder('s')
      .leftJoin('s.product', 'product')
      .select('s.product_id')
      .addSelect('SUM(s.quantity_remaining)', 'remaining')
      .addSelect('product.min_stock', 'minStock')
      .groupBy('s.product_id')
      .addGroupBy('product.min_stock')
      .having('SUM(s.quantity_remaining) <= product.min_stock')
      .getRawMany();

    const recentMovements = await this.movementRepo.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      totalProducts: Number(totalProducts?.count || 0),
      totalStock: Number(totalStock?.total || 0),
      lowStockCount: lowStockProducts.length,
      recentMovements,
    };
  }
}
