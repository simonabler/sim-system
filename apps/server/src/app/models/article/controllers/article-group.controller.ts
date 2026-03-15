import {
  Get,
  Put,
  Post,
  Body,
  Controller,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  Param,
  UseGuards,
  ValidationPipe,
  UsePipes,
  Delete,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
//import { JWTAuthGuard } from '../../../authentication/jwt-auth.guard';
import { ReS } from '../../../common/res.model';
//import { PermissionsGuard } from '../../../authentication/permissions.guard';
import { ApiReS } from '../../../common/decorators/apires.decorator';
import { EntityBeingQueried } from '../../users/decorators/user.decorator';
import { UserEntity } from '../../users/serializers/user.serializer';
import { ArticleGroupService } from '../article-group.service';
import { ArticleGroupEntity, extendedArticleGroupForSerializing } from '../serializers/article-group.serializer';
import { CreateArticleGroupDto } from '../dto/create-article-group.dto';
import { UpdateArticleGroupDto } from '../dto/update-article-group.dto';

@ApiBearerAuth()
@Controller('articlegroups')
@ApiTags('article-group')
@ApiExtraModels(ReS)
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
 groups: extendedArticleGroupForSerializing,
})
export class ArticleGroupController {
  constructor(
    private readonly articleGroupService: ArticleGroupService,
  ) {
  }
  @Get('/:id')
  @ApiOperation({
    summary: 'Get specific article group',
    description: 'Fetchs data of id',
  })
  async get(@Param('id') id: number): Promise<ReS<ArticleGroupEntity>> {
    return ReS.FromData(await this.articleGroupService.get(id));
  }

  @Get()
  @ApiOperation({
    summary: 'Get all article groups',
    description: 'Fetchs all data',
  })
  async getAll(): Promise<ReS<ArticleGroupEntity[]>> {
    return ReS.FromData(await this.articleGroupService.getAll());
  }
  
  @Post()
  @ApiOperation({
    summary: 'Create new article group',
    description: 'Create new article group',
  })
  async post(@Body() articleGroup: CreateArticleGroupDto): Promise<ReS<ArticleGroupEntity>> {
    return ReS.FromData(await this.articleGroupService.create(articleGroup));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update article group',
    description: 'Update article froup from ID',
  })
  async update(@Param('id') id: number, @Body() updateArticleGroupDto: UpdateArticleGroupDto) {
    return ReS.FromData(await this.articleGroupService.update(id,updateArticleGroupDto));
  }

}
