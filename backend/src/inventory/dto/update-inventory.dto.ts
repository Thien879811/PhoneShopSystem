import { IsString, IsNumber, Min, IsOptional, IsEnum, IsPositive } from 'class-validator';
import { InventoryStatus } from '../inventory.entity';

export class UpdateInventoryDto {
  @IsString()
  @IsOptional()
  productCode?: string;

  @IsString()
  @IsOptional()
  productName?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  importPrice?: number;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  sellPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minQuantity?: number;

  @IsString()
  @IsOptional()
  warehouseLocation?: string;

  @IsString()
  @IsOptional()
  imei?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(InventoryStatus)
  @IsOptional()
  status?: InventoryStatus;
}
export class UpdateQuantityDto {
  @IsNumber()
  @Min(0, { message: 'quantity cannot be negative' })
  @IsOptional()
  quantity: number;
}
