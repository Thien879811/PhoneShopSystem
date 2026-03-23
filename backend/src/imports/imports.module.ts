import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportReceipt, ImportReceiptItem } from './import-receipt.entity';
import { Stock } from '../stocks/stock.entity';
import { StockMovement } from '../stocks/stock-movement.entity';
import { ProductImei } from '../imei/product-imei.entity';
import { Product } from '../products/product.entity';
import { ImportsService } from './imports.service';
import { ImportsController } from './imports.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImportReceipt,
      ImportReceiptItem,
      Stock,
      StockMovement,
      ProductImei,
      Product,
    ]),
  ],
  controllers: [ImportsController],
  providers: [ImportsService],
  exports: [ImportsService],
})
export class ImportsModule {}
