import { Controller, Get, Post, Body, Param, Delete, Put, Patch, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto, UpdateQuantityDto } from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.inventoryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(+id);
  }

  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Post('batch')
  createBatch(@Body() createInventoryDtos: CreateInventoryDto[]) {
    return this.inventoryService.createBatch(createInventoryDtos);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(+id, updateInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }

  @Patch(':id/quantity')
  updateQuantity(@Param('id') id: string, @Body() updateQuantityDto: UpdateQuantityDto) {
    return this.inventoryService.updateQuantity(+id, updateQuantityDto);
  }
}
