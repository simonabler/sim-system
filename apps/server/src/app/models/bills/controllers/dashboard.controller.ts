import {
  Get,
  Controller,
  Param,
  forwardRef,
  Inject,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReS } from '../../../common/res.model';
import { AppConfigService } from 'src/config/app/config.service';
import { SlipsheetService } from '../slipsheet.service';
import { CustomerService } from '../../customer/customer.service';
import { TimeRangeDto } from '../../../common/dto/time-range.dto';
import { DashboardService } from '../dashboard.service';
import { DashboardSummaryQueryDto } from '../dto/dashboard-summary-query.dto';

@ApiBearerAuth()
@Controller('dashboard')
@ApiTags('dashboard')
@ApiExtraModels(ReS)
@ApiResponse({ status: 403, description: 'Forbidden.' })
export class DashboardController {
  constructor(
    private readonly slipsheetService: SlipsheetService,
    private readonly dashboardService: DashboardService,
    private readonly appConfigService: AppConfigService,
    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService,
  ) {}

  @Get('/summary')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getSummary(
    @Query() query: DashboardSummaryQueryDto,
  ): Promise<ReS<any>> {
    return ReS.FromData(await this.dashboardService.getSummary(query));
  }

  @Get('/verbrauch/:customerId')
  async get(
    @Param('customerId') customerId: number,
    @Query() timerange: TimeRangeDto
  ): Promise<ReS<any>> {

    // const customer = await this.customerService.get(customerId);

    return ReS.FromData(
      await this.slipsheetService.findFromCustomer(customerId, timerange)
    );
  }

}
