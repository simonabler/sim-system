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
import { OrderEntryService } from '../order-entry.service';
import { extendedOrderEntryForSerializing, OrderEntryEntity } from '../serializers/order-entry.serializer';
import { UpdateOrderEntryDto } from '../dto/update-order-entry.dto';
//import { CreateArticleDto } from '../dto/create-order-entry.dto';
//import { UpdateArticleDto } from '../dto/update-order-entry.dto';

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
    summary: 'Get specific customer',
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

  /*   @Post()
     @ApiOperation({
       summary: 'Create new Article',
       description: 'Create new Article',
     })
     async post(@Body() orderEntry: CreateArticleDto): Promise<ReS<OrderEntryEntity>> {
       console.log(orderEntry)
       return ReS.FromData(await this.orderEntryService.create(orderEntry));
     }
   */
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
