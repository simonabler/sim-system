import {
  Get,
  Post,
  Body,
  Controller,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReS } from '../../../common/res.model';
import { AnnotationService } from '../annotation.service';
import { extendedAnnotationForSerializing, AnnotationEntity } from '../serializers/annotation.serializer';
import { CreateAnnotationDto } from '../dto/create-annotation.dto';
import { UpdateAnnotationDto } from '../dto/update-annotation.dto';
import { SlipsheetService } from '../slipsheet.service';
import { BillService } from '../bill.service';

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
    private readonly slipsheetService: SlipsheetService,
    private readonly billService: BillService,
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
    return ReS.FromData(await this.annotationService.create(annotation));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update annotation',
    description: 'Update annotation from ID',
  })
  async update(@Param('id') id: number, @Body() updateAnnotationDto: UpdateAnnotationDto) {
    const annotation = await this.annotationService.get(+id, ['slipsheet'], true);
    await this.slipsheetService.changed(annotation.slipsheet);
    if (annotation.slipsheet.billId)
      await this.billService.changed(annotation.slipsheet.billId);

    return ReS.FromData(await this.annotationService.update(+id, updateAnnotationDto));
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete annotation',
    description: 'Delete annotation from ID',
  })
  async delete(@Param('id') id: number): Promise<ReS<null>> {
    const annotation = await this.annotationService.get(+id, ['slipsheet'], true);
    await this.annotationService.delete(+id, true);
    await this.slipsheetService.changed(annotation.slipsheet);
    if (annotation.slipsheet.billId)
      await this.billService.changed(annotation.slipsheet.billId);

    return ReS.FromData(null);
  }

}
