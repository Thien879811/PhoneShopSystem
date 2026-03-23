import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateSalesInvoiceDto) {
    return this.salesService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesService.remove(+id);
  }
}
