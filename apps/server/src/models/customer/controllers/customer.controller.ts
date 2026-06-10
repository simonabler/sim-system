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
  Delete,
  Patch,
  forwardRef,
  Inject,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReS } from '../../../common/res.model';
import { ApiReS } from '../../../common/decorators/apires.decorator';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerEntity, defaultCustomerForSerializing } from '../serializers/customer.serializer';
import { CustomerService } from '../customer.service';
import { AddOrderEntryDto } from '../../bills/dto/add-order-entry.dto';
import { OrderEntryService } from '../../bills/order-entry.service';
import { defaultOrderEntryForSerializing, OrderEntryEntity } from '../../bills/serializers/order-entry.serializer';
import { PdfMakerService } from '../../../common/services/pdfmaker.service';
import { SlipsheetEntity } from '../../bills/serializers/slipsheet.serializer';
import { SlipsheetService } from '../../bills/slipsheet.service';
import { BillEntity, extendedBillForSerializing } from '../../bills/serializers/bill.serializer';
import { BillService } from '../../bills/bill.service';
import { CreateUpdateDiscountDto } from '../../bills/dto/add-update-discount.dto';
import { DiscountService } from '../../bills/discount.service';
import { DiscountEntity } from '../../bills/serializers/discount.serializer';



@ApiBearerAuth()
@Controller('customers')
@ApiTags('customers')
@ApiExtraModels(ReS)
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  excludeExtraneousValues: true,
  groups: defaultCustomerForSerializing,
})
export class CustomerController {
  constructor(
    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService,
    private readonly discountService: DiscountService,
    private readonly orderEntryService: OrderEntryService,
    private readonly pdfMakerService: PdfMakerService,
    @Inject(forwardRef(() => SlipsheetService))
    private readonly slipsheetRepository: SlipsheetService,
    @Inject(forwardRef(() => BillService))
    private readonly billService: BillService,
  ) {
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Get specific customer',
    description: 'Fetchs data of id',
  })
  async get(@Param('id') id: number): Promise<ReS<CustomerEntity>> {
    return ReS.FromData(await this.customerService.get(id, ['discounts', 'discounts.articleGroup']));
  }

  @Get('/:id/slipsheets')
  @ApiOperation({
    summary: 'Get slipsheets for customer',
    description: 'Fetchs data of id',
  })
  async getSlipsheets(@Param('id') id: number): Promise<ReS<SlipsheetEntity[]>> {
    let returnSlipsheet = await this.slipsheetRepository.findFromCustomer(id);
    return ReS.FromData(returnSlipsheet);
  }

  @Get('/:id/bills')
  @ApiOperation({
    summary: 'Get bills for customer',
    description: 'Fetchs data of id',
  })
  @SerializeOptions({
    excludeExtraneousValues: true,
    groups: [...defaultCustomerForSerializing, ...extendedBillForSerializing],
  })
  async getBills(@Param('id') id: number): Promise<ReS<BillEntity[]>> {
    return ReS.FromData(await this.billService.findFromCustomer(id));
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({
    summary: 'Get all customer',
    description: 'Fetchs all data',
  })
  async getAll(): Promise<ReS<CustomerEntity[]>> {
    return ReS.FromData(await this.customerService.getAll());
  }

  @Post()
  @ApiOperation({
    summary: 'Create customer',
    description: 'Fetchs data of id',
  })
  async post(@Body() customer: CreateCustomerDto): Promise<ReS<CustomerEntity>> {
    console.log(customer);
    return ReS.FromData(await this.customerService.create(customer));
  }

  @Post('/:id/order')
  @ApiOperation({
    summary: 'Add article to open slipsheet',
    description: 'Fetchs data of id',
  })
  @SerializeOptions({
    groups: defaultOrderEntryForSerializing,
  })
  async postOrder(
    @Param('id') id: number,
    @Body() addOrderEntryDto: AddOrderEntryDto): Promise<ReS<OrderEntryEntity>> {
    let customer = await this.customerService.get(id);

    const ret = await this.orderEntryService.addOrderToSlipsheet(
      {
        customer,
        addOrderEntry: addOrderEntryDto,
      });
    console.log(ret);
    return ReS.FromData(ret);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateCustomerDto: UpdateCustomerDto) {
    return ReS.FromData(await this.customerService.update(id, updateCustomerDto));
  }

  @Put('/:id/discounts')
  @ApiOperation({
    summary: 'Add or update Discount',
    description: 'Fetchs data of id',
  })
  @SerializeOptions({
    groups: defaultOrderEntryForSerializing,
  })
  async postDiscount(
    @Param('id') id: number,
    @Body() addUpdateDiscountOrderEntryDto: CreateUpdateDiscountDto): Promise<ReS<DiscountEntity>> {

    let customer = await this.customerService.get(id);
    return ReS.FromData(await this.discountService.createOrUpdate(customer, addUpdateDiscountOrderEntryDto));
  }

}
