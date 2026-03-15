import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../common/shared.module';
import { CustomerRepository } from './customer.repository';
import { CustomerService } from './customer.service';
import { CustomerController } from './controllers/customer.controller';
import { BillModule } from '../bills/bill.module';
import { OrderEntryService } from '../bills/order-entry.service';
import { ArticleModule } from '../article/article.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerRepository,
    ]),
    SharedModule,
    forwardRef(() => BillModule),
    ArticleModule
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
