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
import { AnnotationService } from '../annotation.service';
import { extendedAnnotationForSerializing, AnnotationEntity } from '../serializers/annotation.serializer';
import { CreateAnnotationDto } from '../dto/create-annotation.dto';
import { UpdateAnnotationDto } from '../dto/update-annotation.dto';

@ApiBearerAuth()
@Controller('annotation')
@ApiTags('annotation')
@ApiExtraModels(ReS)
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  groups: extendedAnnotationForSerializing,
})
export class AnnotationController {
  constructor(
    private readonly annotationService: AnnotationService,
  ) {

  }
  @Get('/:id')
  @ApiOperation({
    summary: 'Get specific annotation',
    description: 'Fetchs data of id',
  })
  async get(@Param('id') id: number): Promise<ReS<AnnotationEntity>> {
    return ReS.FromData(await this.annotationService.get(id));
  }

  @Get()
  @ApiOperation({
    summary: 'Get all annotations',
    description: 'Fetchs all data',
  })
  async getAll(): Promise<ReS<AnnotationEntity[]>> {
    return ReS.FromData(await this.annotationService.getAll());
  }

  @Post()
  @ApiOperation({
    summary: 'Create new annotation',
    description: 'Create new annotation',
  })
  async post(@Body() annotation: CreateAnnotationDto): Promise<ReS<AnnotationEntity>> {
    console.log(annotation)
    return ReS.FromData(await this.annotationService.create(annotation));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update annotation',
    description: 'Update annotation from ID',
  })
  async update(@Param('id') id: number, @Body() updateArticleDto: UpdateAnnotationDto) {
    return ReS.FromData(await this.annotationService.update(id, updateArticleDto));
  }

}
