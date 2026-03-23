import { Controller, Get, Query, Param } from '@nestjs/common';
import { StocksService } from './stocks.service';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get('summary')
  getStockSummary(@Query() query: any) {
    return this.stocksService.getStockSummary(query);
  }

  @Get('dashboard')
  getDashboardStats() {
    return this.stocksService.getDashboardStats();
  }

  @Get('movements')
  getMovements(@Query() query: any) {
    return this.stocksService.getMovements(query);
  }

  @Get('product/:productId')
  getStockByProduct(@Param('productId') productId: string) {
    return this.stocksService.getStockByProduct(+productId);
  }
}
