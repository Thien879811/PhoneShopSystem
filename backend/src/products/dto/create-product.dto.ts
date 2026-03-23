import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ProductStatus } from '../product.entity';

export class CreateProductDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsNumber()
  brandId?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsNumber()
  sellPrice?: number;

  @IsOptional()
  @IsNumber()
  minStock?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
