import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { ArticleGroupRepository } from './article-group.repository';
import { ArticleGroup } from './entities/article-group.entity';
import { ArticleGroupEntity } from './serializers/article-group.serializer';

@Injectable()
export class ArticleGroupService extends BaseService<ArticleGroup, ArticleGroupEntity> {

  constructor(
    @InjectRepository(ArticleGroupRepository)
    private readonly articleGroupRepository: ArticleGroupRepository,
  ) { super(articleGroupRepository) }

  
}
