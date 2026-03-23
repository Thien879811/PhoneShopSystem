import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { RepairsService } from './repairs.service';

@Controller('repair-orders')
export class RepairsController {
  constructor(private readonly repairsService: RepairsService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.repairsService.findAll(query);
  }

  @Get('services')
  async findAllServices() {
    return this.repairsService.findAllServices();
  }

  @Post('services')
  async createService(@Body() dto: any) {
    return this.repairsService.createService(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.repairsService.findOne(+id);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.repairsService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.repairsService.update(+id, dto);
  }

  @Post(':id/add-service')
  async addService(@Param('id') id: string, @Body() dto: any) {
    return this.repairsService.addService(+id, dto);
  }

  // Keep old endpoint for compatibility if needed, but the prompt asked for add-service
  @Post(':id/items')
  async addItem(@Param('id') id: string, @Body() dto: any) {
    return this.repairsService.addService(+id, dto);
  }

  @Delete(':id/items/:itemId')
  async removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.repairsService.removeItem(+id, +itemId);
  }

  @Post(':id/complete')
  async complete(@Param('id') id: string) {
    return this.repairsService.completeRepair(+id);
  }

  @Post('quick-import')
  async quickImport(@Body() dto: any) {
    return this.repairsService.quickImport(dto);
  }
}
