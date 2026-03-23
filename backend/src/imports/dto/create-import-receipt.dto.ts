import { IsNumber, IsOptional, IsString, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateImportItemDto {
  @IsNumber()
  productId: number;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  importPrice: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imeis?: string[];
}

export class CreateImportReceiptDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsNumber()
  supplierId?: number;

  @IsOptional()
  @IsDateString()
  importDate?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImportItemDto)
  items: CreateImportItemDto[];
}
