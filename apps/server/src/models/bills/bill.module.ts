import { forwardRef, Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './controllers/bill.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillRepository } from './bill.repository';
import { OrderEntryService } from './order-entry.service';
import { OrderEntryRepository } from './order-entry.repository';
import { SlipsheetRepository } from './slipsheet.repository';
import { SlipsheetService } from './slipsheet.service';
import { ArticleModule } from '../article/article.module';
import { SharedModule } from '../../common/shared.module';
import { SlipsheetController } from './controllers/slipsheet.controller';
import { AppConfigModule } from '../../config/app/config.module';
import { AnnotationRepository } from './annotation.repository';
import { AnnotationService } from './annotation.service';
import { AnnotationController } from './controllers/annotation.controller';
import { CustomerModule } from '../customer/customer.module';
import { OrderEntryController } from './controllers/order-entry.controller';
import { DiscountRepository } from './discount.repository';
import { DiscountService } from './discount.service';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './dashboard.service';
import { InventoryRepository } from '../article/inventory.repository';
import { Bill } from './entities/bill.entity';
import { Slipsheet } from './entities/slipsheet.entity';
import { OrderEntry } from './entities/order-entry.entity';
import { Annotation } from './entities/annotation.entity';
import { Discount } from './entities/discount.entity';
import { Inventory } from '../article/entities/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bill,
      Slipsheet,
      OrderEntry,
      Annotation,
      Discount,
      Inventory,
    ]),
    ArticleModule,
    AppConfigModule,
    SharedModule,
    forwardRef(() => CustomerModule),
  ],

  controllers: [
    BillController,
    SlipsheetController,
    AnnotationController,
    OrderEntryController,
    DashboardController,
  ],
  providers: [
    BillRepository,
    SlipsheetRepository,
    OrderEntryRepository,
    AnnotationRepository,
    DiscountRepository,
    // InventoryRepository is exported from ArticleModule — do not re-declare here
    BillService,
    OrderEntryService,
    SlipsheetService,
    AnnotationService,
    DiscountService,
    DashboardService,
  ],
  exports: [OrderEntryService, SlipsheetService, BillService, DiscountService],
})
export class BillModule {}
