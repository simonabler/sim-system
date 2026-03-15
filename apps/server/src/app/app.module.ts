import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './common/shared.module';
import { AppConfigModule } from './config/app/config.module';
import { SqliteConfigModule } from './config/database/sqlite/config.module';
import { ArticleModule } from './models/article/article.module';
import { BillModule } from './models/bills/bill.module';
import { CustomerModule } from './models/customer/customer.module';
import { SqliteDatabaseProviderModule } from './providers/database/sqlite/provider.module';

const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    AppConfigModule,
    SqliteConfigModule,
    SqliteDatabaseProviderModule,
    ArticleModule,
    CustomerModule,
    BillModule,
    SharedModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
