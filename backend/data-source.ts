import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  username: process.env.DB_USERNAME || 'root_shop',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_DATABASE || 'phoneshop',
  entities: [join(__dirname, 'src/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'src/migrations/*{.ts,.js}')],
  synchronize: false,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  extra: {
    trustServerCertificate: true,
  }
});
