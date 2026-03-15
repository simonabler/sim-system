import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, Length, ValidateNested } from 'class-validator';
import { IdDto } from '../../../common/dto/id.dto';
import { ArticleGroupEntity } from '../serializers/article-group.serializer';

export class CreateArticleGroupDto  {
  @ApiProperty({
    example: 'Schrauben',
    description: 'Name of group',
  })
  @IsNotEmpty()
  name: string;
}
