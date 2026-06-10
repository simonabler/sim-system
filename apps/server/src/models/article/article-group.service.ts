import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/base.service';
import { ArticleGroupRepository } from './article-group.repository';
import { ArticleGroup } from './entities/article-group.entity';
import { ArticleGroupEntity } from './serializers/article-group.serializer';

@Injectable()
export class ArticleGroupService extends BaseService<ArticleGroup, ArticleGroupEntity> {
  constructor(
    private readonly articleGroupRepository: ArticleGroupRepository,
  ) {
    super(articleGroupRepository);
  }
}
