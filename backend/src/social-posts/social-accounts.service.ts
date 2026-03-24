import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialAccount } from './entities/social-account.entity';
import { CreateSocialAccountDto, UpdateSocialAccountDto } from './dto/social-account.dto';
import axios from 'axios';

@Injectable()
export class SocialAccountsService {
  constructor(
    @InjectRepository(SocialAccount)
    private readonly accountRepo: Repository<SocialAccount>,
  ) {}

  async findAll() {
    return this.accountRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const account = await this.accountRepo.findOne({ where: { id } });
    if (!account) throw new NotFoundException(`Social account #${id} not found`);
    return account;
  }

  async create(dto: CreateSocialAccountDto) {
    const account = this.accountRepo.create(dto);
    return this.accountRepo.save(account);
  }

  async update(id: number, dto: UpdateSocialAccountDto) {
    const account = await this.findOne(id);
    Object.assign(account, dto);
    return this.accountRepo.save(account);
  }

  async remove(id: number) {
    const account = await this.findOne(id);
    await this.accountRepo.remove(account);
    return { success: true };
  }

  async testConnection(id: number) {
    const account = await this.findOne(id);

    try {
      if (account.platform === 'facebook') {
        const url = `${account.apiUrl || 'https://graph.facebook.com'}/${account.pageId}?access_token=${account.accessToken}&fields=name,id`;
        const response = await axios.get(url);
        return {
          success: true,
          platform: 'facebook',
          data: { name: response.data.name, id: response.data.id },
        };
      } else if (account.platform === 'zalo') {
        const response = await axios.get('https://openapi.zalo.me/v2.0/oa/getoa', {
          headers: { access_token: account.accessToken },
        });
        return {
          success: true,
          platform: 'zalo',
          data: response.data,
        };
      }

      return { success: false, message: 'Unknown platform' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error?.message || error.message || 'Connection failed',
      };
    }
  }
}
