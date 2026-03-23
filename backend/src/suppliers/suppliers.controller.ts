import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.suppliersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(+id);
  }
}
