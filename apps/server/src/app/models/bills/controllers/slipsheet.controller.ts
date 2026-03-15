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
  Response,
  ValidationPipe,
  UsePipes,
  Delete,
  Patch,
  StreamableFile,
  NotFoundException,
  Query,
  forwardRef,
  Inject,
  DefaultValuePipe,
  ParseBoolPipe,
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
import { SlipsheetService } from '../slipsheet.service';
import { extendedSlipsheetForSerializing, SlipsheetEntity } from '../serializers/slipsheet.serializer';
import { PdfMakerService } from '../../../common/services/pdfmaker.service';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { AppConfigService } from '../../../config/app/config.service';
import { SlipsheetState } from '../enums/slipsheet-state.enum';
import { CreateAnnotationDto } from '../dto/create-annotation.dto';
import { AnnotationEntity } from '../serializers/annotation.serializer';
import { AnnotationService } from '../annotation.service';
//import { CreateArticleDto } from '../dto/create-slipsheet.dto';
//import { UpdateArticleDto } from '../dto/update-slipsheet.dto';
import { DeepPartial } from 'typeorm';
import { NotFoundError } from 'rxjs';
import { Slipsheet } from '../entities/slipsheet.entity';
import { CustomerService } from '../../customer/customer.service';
import { AddOrderEntryDto } from '../dto/add-order-entry.dto';
import { OrderEntryEntity } from '../serializers/order-entry.serializer';
import { OrderEntryService } from '../order-entry.service';
import { PrinterService } from '../../../common/services/printer.service';
import { BillService } from '../bill.service';

@ApiBearerAuth()
@Controller('slipsheets')
@ApiTags('slipsheets')
@ApiExtraModels(ReS)
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  groups: extendedSlipsheetForSerializing,
})
export class SlipsheetController {
  constructor(
    @Inject(forwardRef(() => SlipsheetService))
    private readonly slipsheetService: SlipsheetService,
    private readonly billService: BillService,
    private readonly orderEntryService: OrderEntryService,
    private readonly annotationService: AnnotationService,
    private readonly appConfigService: AppConfigService,
    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService,
    private readonly printerService: PrinterService,
  ) {

  }

  @Get()
  @ApiOperation({
    summary: 'Get all slipsheets',
    description: 'Fetchs all data',
  })
  async getAll(
    @Query('customerId') customerId: number,
    @Query('state') state?: SlipsheetState,
  ): Promise<ReS<SlipsheetEntity[]>> {
    if (customerId)
      return ReS.FromData([await this.slipsheetService.findOpenForCustomer(await this.customerService.get(customerId))]);
    else if (state)
      return ReS.FromData(await this.slipsheetService.findByState(state));
    else
      return ReS.FromData(await this.slipsheetService.getAll(this.slipsheetService.getAllRelations(),
      ));
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Get specific customer',
    description: 'Fetchs data of id',
  })
  async get(@Param('id') id: number): Promise<ReS<SlipsheetEntity>> {
    const slip = (await this.slipsheetService.getAllInformations([id]))[0];
    if (!slip) {
      throw new NotFoundException('Lieferschein nicht gefunden');
    }
    return ReS.FromData(slip);
  }

  @Get('/:id/pdf')
  @ApiOperation({
    summary: 'Get specific customer',
    description: 'Fetchs data of id',
  })
  async getPDF(
    @Param('id') id: number,
    @Query('close', new DefaultValuePipe(true), ParseBoolPipe) close: boolean,
    @Response({ passthrough: true }) res): Promise<StreamableFile> {

    let slip: SlipsheetEntity = await this.getOrGenerateSlipsheep(id, close);

    const file = createReadStream(join(this.appConfigService.pdf_slip_path, slip.path));
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="' + slip.path + '"',
    });
    return new StreamableFile(file);
  }

  @Post('/:id/print')
  @ApiOperation({
    summary: 'Print PDF',
    description: '',
  })
  async printPDF(
    @Param('id') id: number,
    @Response({ passthrough: true }) res): Promise<ReS<boolean>> {

    let slip: SlipsheetEntity = await this.getOrGenerateSlipsheep(id, true);

    return ReS.FromData(await this.printerService.print(join(this.appConfigService.pdf_slip_path, slip.path)));
  }

  private async getOrGenerateSlipsheep(id: number, close: boolean) {
    let slip: SlipsheetEntity = (await this.slipsheetService.getAllInformations([id]))[0];
    if (!slip.path || slip.state === SlipsheetState.OPEN || slip.state === SlipsheetState.CHANGED) {
      slip = await this.slipsheetService.generateSlipsheet(id, close);
    } else if (!existsSync(join(this.appConfigService.pdf_slip_path, slip.path))) {
      slip = await this.slipsheetService.generateSlipsheet(id, close);
    }
    return slip;
  }

  @Post('/:id/annotation')
  @ApiOperation({
    summary: 'Get specific customer',
    description: 'Fetchs data of id',
  })
  async addAnnotation(
    @Param('id') id: number,
    @Body() annotation: CreateAnnotationDto

  ): Promise<ReS<AnnotationEntity>> {

    const annotationToAdd = new AnnotationEntity();
    annotationToAdd.text = annotation.text;
    annotationToAdd.slipsheet = await this.slipsheetService.get(id);

    await this.slipsheetService.changed(annotationToAdd.slipsheet);
    if (annotationToAdd.slipsheet.billId)
      await this.billService.changed(annotationToAdd.slipsheet.billId);

    return ReS.FromData(await this.annotationService.create(annotationToAdd));
  }

  @Post()
  @ApiOperation({
    summary: 'Add article to open slipsheet',
    description: 'Fetchs data of id',
  })

  async postOrderOpenSlipsheet(
    @Body() addOrderEntryDto: AddOrderEntryDto): Promise<ReS<SlipsheetEntity>> {

    let customer = await this.customerService.get(addOrderEntryDto.customer.id, ['discounts', 'discounts.articleGroup']);
    let slipsheet = await this.slipsheetService.findOpenForCustomer(customer);

    const ret = await this.orderEntryService.addOrderToSlipsheet(
      {
        customer,
        slipsheet,
        addOrderEntry: addOrderEntryDto
      });
    console.log(ret)
    return ReS.FromData((await this.slipsheetService.getAllInformations([ret.slipsheet.id]))[0]);
  }

  @Post("/:id")
  @ApiOperation({
    summary: 'Add article to existing slipsheet',
    description: 'Fetchs data of id',
  })

  async postOrder(
    @Param('id') id: number,
    @Body() addOrderEntryDto: AddOrderEntryDto): Promise<ReS<SlipsheetEntity>> {

    let slipsheet = (await this.slipsheetService.getAllInformations([id]))[0];

    const ret = await this.orderEntryService.addOrderToSlipsheet(
      {
        customer: slipsheet.customer,
        slipsheet: slipsheet,
        addOrderEntry: addOrderEntryDto
      });
    return ReS.FromData((await this.slipsheetService.getAllInformations([ret.slipsheet.id]))[0]);
  }

  @Post('/:id/close')
  @ApiOperation({
    summary: 'Get specific customer',
    description: 'Fetchs data of id',
  })
  async closeSlipsheet(
    @Param('id') id: number
  ): Promise<ReS<SlipsheetEntity>> {

    let slip: SlipsheetEntity = await this.slipsheetService.generateSlipsheet(id, true);
    return ReS.FromData(slip);

  }

  /*   @Post()
     @ApiOperation({
       summary: 'Create new Article',
       description: 'Create new Article',
     })
     async post(@Body() slipsheet: CreateArticleDto): Promise<ReS<SlipsheetEntity>> {
       console.log(slipsheet)
       return ReS.FromData(await this.slipsheetService.create(slipsheet));
     }
   
     @Patch(':id')
     @ApiOperation({
       summary: 'Update Article',
       description: 'Update Article from ID',
     })
     async update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
       return ReS.FromData(await this.slipsheetService.update(id,updateArticleDto));
     }
   */
}
