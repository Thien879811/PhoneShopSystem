import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { BrandsService } from './brands.service';

@Controller('brands')
export class BrandsController {
  constructor(private readonly service: BrandsService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Post() create(@Body() data: any) { return this.service.create(data); }
  @Put(':id') update(@Param('id') id: string, @Body() data: any) { return this.service.update(+id, data); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(+id); }
}
