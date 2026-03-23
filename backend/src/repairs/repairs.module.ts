import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepairOrder } from './entities/repair-order.entity';
import { RepairOrderItem } from './entities/repair-order-item.entity';
import { RepairService } from './entities/repair-service.entity';
import { RepairStatusLog } from './entities/repair-status-log.entity';
import { RepairsService } from './repairs.service';
import { RepairsController } from './repairs.controller';
import { Product } from '../products/product.entity';
import { Stock } from '../stocks/stock.entity';
import { StockMovement } from '../stocks/stock-movement.entity';
import { ImportReceipt, ImportReceiptItem } from '../imports/import-receipt.entity';
import { SalesInvoice, SalesInvoiceItem } from '../sales/sales-invoice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RepairOrder,
      RepairOrderItem,
      RepairService,
      RepairStatusLog,
      Product,
      Stock,
      StockMovement,
      ImportReceipt,
      ImportReceiptItem,
      SalesInvoice,
      SalesInvoiceItem,
    ]),
  ],
  providers: [RepairsService],
  controllers: [RepairsController],
  exports: [RepairsService],
})
export class RepairsModule {}
