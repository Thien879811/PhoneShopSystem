import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import { Product } from './products/product.entity';
import { Supplier } from './suppliers/supplier.entity';
import { ImportReceipt, ImportReceiptItem } from './imports/import-receipt.entity';
import { Stock } from './stocks/stock.entity';
import { StockMovement } from './stocks/stock-movement.entity';
import { SalesInvoice, SalesInvoiceItem } from './sales/sales-invoice.entity';
import { ProductImei } from './imei/product-imei.entity';
import { Category } from './categories/category.entity';
import { Brand } from './brands/brand.entity';

// Modules
import { ProductsModule } from './products/products.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ImportsModule } from './imports/imports.module';
import { StocksModule } from './stocks/stocks.module';
import { SalesModule } from './sales/sales.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '1433', 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          Product,
          Supplier,
          ImportReceipt,
          ImportReceiptItem,
          Stock,
          StockMovement,
          SalesInvoice,
          SalesInvoiceItem,
          ProductImei,
          Category,
          Brand,
        ],
        synchronize: true,
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
        extra: {
          validateConnection: false,
          trustServerCertificate: true,
        },
      }),
    }),
    ProductsModule,
    SuppliersModule,
    ImportsModule,
    StocksModule,
    SalesModule,
    CategoriesModule,
    BrandsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
