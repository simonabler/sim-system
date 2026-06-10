import {
  Get,
  Put,
  Body,
  Controller,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReS } from '../../../common/res.model';
import { OrderEntryService } from '../order-entry.service';
import { extendedOrderEntryForSerializing, OrderEntryEntity } from '../serializers/order-entry.serializer';
import { UpdateOrderEntryDto } from '../dto/update-order-entry.dto';

@ApiBearerAuth()
@Controller('order-entries')
@ApiTags('order-entries')
@ApiExtraModels(ReS)
@ApiResponse({ status: 403, description: 'Forbidden.' })
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  groups: extendedOrderEntryForSerializing,
})
export class OrderEntryController {
  constructor(
    private readonly orderEntryService: OrderEntryService,
  ) {

  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Get specific order entry',
    description: 'Fetchs data of id',
  })
  async get(@Param('id') id: number): Promise<ReS<OrderEntryEntity>> {
    return ReS.FromData(await this.orderEntryService.get(id));
  }

  @Get()
  @ApiOperation({
    summary: 'Get all orderEntrys',
    description: 'Fetchs all data',
  })
  async getAll(): Promise<ReS<OrderEntryEntity[]>> {
    return ReS.FromData(await this.orderEntryService.getAll());
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update Order Article',
    description: 'Update Order from ID',
  })
  async update(
    @Param('id') id: number,
    @Body() updateOrderDto: UpdateOrderEntryDto) {
    return ReS.FromData(await this.orderEntryService.update(id, updateOrderDto));
  }

}
