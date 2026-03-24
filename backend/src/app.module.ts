import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
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
import { RepairsModule } from './repairs/repairs.module';
import { SocialPostsModule } from './social-posts/social-posts.module';

// Entities for TypeORM (needed inside forRoot if using sync and want them grouped here)
import { RepairOrder } from './repairs/entities/repair-order.entity';
import { RepairService } from './repairs/entities/repair-service.entity';
import { RepairOrderItem } from './repairs/entities/repair-order-item.entity';
import { RepairStatusLog } from './repairs/entities/repair-status-log.entity';
import { SocialAccount } from './social-posts/entities/social-account.entity';
import { SocialPost } from './social-posts/entities/social-post.entity';
import { PostImage } from './social-posts/entities/post-image.entity';
import { PostPlatform } from './social-posts/entities/post-platform.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
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
          RepairOrder,
          RepairService,
          RepairOrderItem,
          RepairStatusLog,
          SocialAccount,
          SocialPost,
          PostImage,
          PostPlatform,
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
    RepairsModule,
    SocialPostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
