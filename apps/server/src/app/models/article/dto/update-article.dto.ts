import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, Length, ValidateNested } from 'class-validator';
import { IdDto } from '../../../common/dto/id.dto';
import { ArticleGroupEntity } from '../serializers/article-group.serializer';
import { CreateArticleDto } from './create-article.dto';

export class UpdateArticleDto extends CreateArticleDto {

}
