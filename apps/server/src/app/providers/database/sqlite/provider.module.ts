import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SqliteConfigService } from '../../../config/database/sqlite/config.service';
import { SqliteConfigModule } from '../../../config/database/sqlite/config.module';

// Import all entities explicitly (TypeORM v0.3 requires class references, not glob strings)
import { Article as ArticleEntity } from '../../../models/article/entities/article.entity';
import { ArticleGroup as ArticleGroupEntity } from '../../../models/article/entities/article-group.entity';
import { Inventory as InventoryEntity } from '../../../models/article/entities/inventory.entity';
import { Bill as BillEntity } from '../../../models/bills/entities/bill.entity';
import { Slipsheet as SlipsheetEntity } from '../../../models/bills/entities/slipsheet.entity';
import { OrderEntry as OrderEntryEntity } from '../../../models/bills/entities/order-entry.entity';
import { Discount as DiscountEntity } from '../../../models/bills/entities/discount.entity';
import { Annotation as AnnotationEntity } from '../../../models/bills/entities/annotation.entity';
import { Customer as CustomerEntity } from '../../../models/customer/entities/customer.entity';

const entities = [
  ArticleEntity, ArticleGroupEntity, InventoryEntity,
  BillEntity, SlipsheetEntity, OrderEntryEntity, DiscountEntity, AnnotationEntity,
  CustomerEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [SqliteConfigModule],
      useFactory: async (sqliteConfigService: SqliteConfigService) => ({
        type: 'sqlite',
        database: sqliteConfigService.path,
        entities,
        migrations: ['dist/migrations/*.js'],
        migrationsRun: sqliteConfigService.migrationsRun,
        synchronize: sqliteConfigService.synchronizeRun,
        logging: process.env.NODE_ENV === 'development',
      }),
      inject: [SqliteConfigService],
    }),
  ],
})
export class SqliteDatabaseProviderModule {}
