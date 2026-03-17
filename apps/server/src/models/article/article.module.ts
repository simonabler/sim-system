import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../common/shared.module';
import { ArticleGroupRepository } from './article-group.repository';
import { ArticleGroupService } from './article-group.service';
import { ArticleRepository } from './article.repository';
import { ArticleService } from './article.service';
import { ArticleGroupController } from './controllers/article-group.controller';
import { ArticleController } from './controllers/article.controller';
import { CsvModule } from 'nest-csv-parser';
import { InventoryRepository } from './inventory.repository';
import { InventoryService } from './inventory.service';
import { Article } from './entities/article.entity';
import { ArticleGroup } from './entities/article-group.entity';
import { Inventory } from './entities/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, ArticleGroup, Inventory]),
    SharedModule,
    CsvModule,
  ],
  controllers: [ArticleController, ArticleGroupController],
  providers: [
    ArticleRepository,
    ArticleGroupRepository,
    InventoryRepository,
    ArticleService,
    ArticleGroupService,
    InventoryService,
  ],
  exports: [ArticleService, ArticleGroupService, InventoryRepository],
})
export class ArticleModule {}
