import {
  Get,
  Post,
  Body,
  Controller,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  Param,
  Response,
  Delete,
  NotFoundException,
  StreamableFile,
  Query,
  Put,
} from '@nestjs/common';
import {
  BillEntity,
  extendedBillForSerializing,
} from '../serializers/bill.serializer';
import { BillService } from '../bill.service';
import { CreateBillDto } from '../dto/create-bill.dto';
import { UpdateBillDto } from '../dto/update-bill.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReS } from '../../../common/res.model';
import { ApiReS } from '../../../common/decorators/apires.decorator';
import { createReadStream } from 'fs';
import { existsSync } from 'fs';
import { join } from 'path';
import { BillState } from '../enums/bill-state.enum';
import { AppConfigService } from '../../../config/app/config.service';
import { SlipsheetEntity } from '../serializers/slipsheet.serializer';
import { SlipsheetService } from '../slipsheet.service';

@ApiBearerAuth()
@Controller('bills')
@ApiTags('bills')
@ApiExtraModels(ReS)
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  groups: extendedBillForSerializing,
})
export class BillController {
  constructor(
    private readonly billService: BillService,
    private readonly slipsheetService: SlipsheetService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @Get('/:id')
  async get(@Param('id') id: number): Promise<ReS<BillEntity>> {
    return ReS.FromData(await this.billService.getAllInformations(id));
  }

  @Get('/')
  async getAll(@Query('state') state?: BillState): Promise<ReS<BillEntity[]>> {
    if (state) {
      return ReS.FromData(await this.billService.findByState(state));
    }
    return ReS.FromData(await this.billService.getAllAllInformations());
  }

  // Bug #2 fix: GET /:id/pdf must NOT regenerate the PDF (side-effect on GET).
  // If the file is missing, return 404 and let the client call POST /:id to regenerate.
  @Get('/:id/pdf')
  @ApiOperation({
    summary: 'Download bill PDF',
    description: 'Returns existing PDF. Returns 404 if not yet generated.',
  })
  async getPDF(
    @Param('id') id: number,
    @Response({ passthrough: true }) res,
  ): Promise<StreamableFile> {
    const bill: BillEntity = await this.billService.getAllInformations(id);

    if (!bill.path) {
      throw new NotFoundException(
        'Rechnung-PDF nicht gefunden. Bitte neu erzeugen.',
      );
    }

    const filepath = join(this.appConfigService.pdf_bill_path, bill.path);
    if (!existsSync(filepath)) {
      throw new NotFoundException(
        'Rechnung-PDF nicht gefunden. Bitte neu erzeugen.',
      );
    }

    const file = createReadStream(filepath);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="' + bill.path + '"',
    });
    return new StreamableFile(file);
  }

  @Post('/')
  @ApiReS(CreateBillDto, 'The record has been successfully created.', 201)
  async create(@Body() inputs: CreateBillDto): Promise<ReS<BillEntity>> {
    console.log(inputs);
    return ReS.FromData(await this.billService.create(inputs));
  }

  @Post('/generate')
  @ApiOperation({
    summary: 'Generate bill from slipsheets',
    description: 'Creates a bill PDF from the given slipsheet IDs',
  })
  async generateBill(@Body() slipsheets: number[]): Promise<ReS<BillEntity>> {
    const slipsheetEntities: SlipsheetEntity[] =
      await this.slipsheetService.getAllInformations(slipsheets);

    const bill: BillEntity = await this.billService.generateBill(
      slipsheetEntities,
    );

    return ReS.FromData(bill);
  }

  @Post('/:id')
  @ApiOperation({
    summary: 'Recreate bill PDF',
    description: 'Regenerates PDF for existing bill',
  })
  async recreateBill(@Param('id') id: number): Promise<ReS<BillEntity>> {
    return ReS.FromData(await this.billService.regenerateBillPdf(id));
  }

  @Put('/:id')
  async update(
    @Param('id') id: number,
    @Body()
    inputs: UpdateBillDto,
  ): Promise<ReS<BillEntity>> {
    return ReS.FromData(await this.billService.updateBill(id, inputs));
  }

  @Delete('/:id')
  async delete(@Param('id') id: number): Promise<ReS<null>> {
    await this.billService.releaseBill(id);
    return ReS.FromData(null);
  }
}
