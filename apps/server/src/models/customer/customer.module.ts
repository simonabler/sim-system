import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../common/shared.module';
import { CustomerRepository } from './customer.repository';
import { CustomerService } from './customer.service';
import { CustomerController } from './controllers/customer.controller';
import { BillModule } from '../bills/bill.module';
import { ArticleModule } from '../article/article.module';
import { Customer } from './entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    SharedModule,
    forwardRef(() => BillModule),
    ArticleModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerRepository, CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
