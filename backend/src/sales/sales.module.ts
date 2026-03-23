import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesInvoice, SalesInvoiceItem } from './sales-invoice.entity';
import { Stock } from '../stocks/stock.entity';
import { StockMovement } from '../stocks/stock-movement.entity';
import { ProductImei } from '../imei/product-imei.entity';
import { Product } from '../products/product.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesInvoice,
      SalesInvoiceItem,
      Stock,
      StockMovement,
      ProductImei,
      Product,
    ]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
