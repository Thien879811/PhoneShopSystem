import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsEnum, IsPositive } from 'class-validator';
import { InventoryStatus } from '../inventory.entity';

export class CreateInventoryDto {
  @IsString()
  @IsNotEmpty()
  productCode: string;

  @IsString()
  @IsNotEmpty({ message: 'productName is required' })
  productName: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsNumber()
  @IsPositive()
  importPrice: number;

  @IsNumber()
  @Min(0.01, { message: 'sellPrice must be > 0' })
  sellPrice: number;

  @IsNumber()
  @Min(0, { message: 'quantity cannot be negative' })
  quantity: number;

  @IsNumber()
  @Min(0, { message: 'minQuantity cannot be negative' })
  minQuantity: number;

  @IsString()
  @IsNotEmpty()
  warehouseLocation: string;

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
