import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { CreateImportReceiptDto } from './dto/create-import-receipt.dto';

@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.importsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.importsService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateImportReceiptDto) {
    return this.importsService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.importsService.remove(+id);
  }
}
