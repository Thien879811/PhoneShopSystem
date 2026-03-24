import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SocialAccountsService } from './social-accounts.service';
import { CreateSocialAccountDto, UpdateSocialAccountDto } from './dto/social-account.dto';

@Controller('social-accounts')
export class SocialAccountsController {
  constructor(private readonly accountsService: SocialAccountsService) {}

  @Get()
  findAll() {
    return this.accountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateSocialAccountDto) {
    return this.accountsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSocialAccountDto) {
    return this.accountsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsService.remove(+id);
  }

  @Post(':id/test-connection')
  testConnection(@Param('id') id: string) {
    return this.accountsService.testConnection(+id);
  }
}
