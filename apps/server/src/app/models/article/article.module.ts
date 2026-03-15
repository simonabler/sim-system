import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../common/shared.module';
import { ArticleGroupRepository } from './article-group.repository';
import { ArticleGroupService } from './article-group.service';
import { ArticleRepository } from './article.repository';
import { ArticleService } from './article.service';
import { ArticleGroupController } from './controllers/article-group.controller';
import { ArticleController } from './controllers/article.controller';
import { CsvModule } from 'nest-csv-parser'
import { InventoryRepository } from './inventory.repository';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArticleRepository,
      ArticleGroupRepository,
      InventoryRepository,
    ]),
    SharedModule,
    CsvModule,
  ],
  controllers: [ArticleController, ArticleGroupController],
  providers: [ArticleService, ArticleGroupService, InventoryService],
  exports: [ArticleService, ArticleGroupService],
})
export class ArticleModule {}
