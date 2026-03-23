import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from './stock.entity';
import { StockMovement } from './stock-movement.entity';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stock, StockMovement])],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
