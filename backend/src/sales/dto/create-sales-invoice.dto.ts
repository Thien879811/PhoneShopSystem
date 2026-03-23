import { IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSalesItemDto {
  @IsNumber()
  productId: number;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imeis?: string[];
}

export class CreateSalesInvoiceDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesItemDto)
  items: CreateSalesItemDto[];
}
