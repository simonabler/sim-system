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
  Query,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,

} from '@nestjs/swagger';
//import { JWTAuthGuard } from '../../../authentication/jwt-auth.guard';
import { ReS } from '../../../common/res.model';
//import { PermissionsGuard } from '../../../authentication/permissions.guard';
import { ArticleService } from '../article.service';
import { ArticleEntity, extendedArticleForSerializing } from '../serializers/article.serializer';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';


@ApiBearerAuth()
@Controller('articles')
@ApiTags('articles')
@ApiExtraModels(ReS)
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  groups: extendedArticleForSerializing,
})

export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
  ) {
  }
  @Get('/:id')
  @ApiOperation({
    summary: 'Get specific customer',
    description: 'Fetchs data of id',
  })
  async get(@Param('id') id: number): Promise<ReS<ArticleEntity>> {
    return ReS.FromData(await this.articleService.get(id));
  }

  @Get()
  @ApiOperation({
    summary: 'Get all articles',
    description: 'Fetchs all data',
  })
  async getAll(
    @Query('code') code?: string,
    @Query('id') id?: number,
  ): Promise<ReS<ArticleEntity[]>> {
    if (code) {
      return ReS.FromData([await this.articleService.getByCode(code)]);
    } else if (id) {
      return ReS.FromData([await this.articleService.get(id)]);
    } else {
      return ReS.FromData(await this.articleService.getAll());
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create new Article',
    description: 'Create new Article',
  })
  async post(@Body() article: CreateArticleDto): Promise<ReS<ArticleEntity>> {
    console.log(article)
    return ReS.FromData(await this.articleService.create(article));
  }

  @Post('/:id/inventory')
  @ApiOperation({
    summary: 'Create article inventory',
    description: 'Create article inventory',
  })
  async postInventory(
    @Param('id') id: number,
    @Body() newStock: UpdateInventoryDto): Promise<ReS<ArticleEntity>> {
    const article = await this.articleService.get(id);
    return ReS.FromData(await this.articleService.makeInventory(article, newStock.newStock));
  }

  @Post("import")
  @ApiOperation({
    summary: 'Create new Article',
    description: 'Create new Article',
  })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'preview' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @SerializeOptions({
    ignoreDecorators: true
  })

  async importCvs(
    @Query("preview") preview: boolean,
    @UploadedFile() file: Express.Multer.File
  ): Promise<any> {

    return ReS.FromData(await this.articleService.importCsv(preview, file));

  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Article',
    description: 'Update Article from ID',
  })
  async update(@Param('id') id: number, @Body() updateArticleDto: UpdateArticleDto) {
    return ReS.FromData(await this.articleService.update(id, updateArticleDto));
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Article',
    description: 'Delete article by id',
  })
  async delete(@Param('id') id: number): Promise<ReS<null>> {
    await this.articleService.delete(id, true);
    return ReS.FromData(null);
  }

}
