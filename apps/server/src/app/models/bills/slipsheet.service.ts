import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { SlipsheetRepository } from './slipsheet.repository';
import { Slipsheet } from './entities/slipsheet.entity';
import { SlipsheetEntity } from './serializers/slipsheet.serializer';
import { CustomerEntity } from '../customer/serializers/customer.serializer';
import { SlipsheetState } from './enums/slipsheet-state.enum';
import { Between, EntityManager } from 'typeorm';
import { join } from 'path';
import { PdfMakerService } from 'src/common/services/pdfmaker.service';
import { AppConfigService } from 'src/config/app/config.service';
import { TimeRangeDto } from '../../common/dto/time-range.dto';

@Injectable()
export class SlipsheetService extends BaseService<Slipsheet, SlipsheetEntity> {
  constructor(
    @InjectRepository(SlipsheetRepository)
    private readonly slipsheetRepository: SlipsheetRepository,
    private readonly pdfMakerService: PdfMakerService,
    private readonly appConfigService: AppConfigService,
  ) {
    super(slipsheetRepository);
  }

  getAllInformations(ids: number[]): Promise<SlipsheetEntity[]> {
    return this.slipsheetRepository.getAll(ids, this.getAllRelations());
  }

  public getAllRelations() {
    return [
      'bill',
      'customer',
      'customer.discounts',
      'customer.discounts.articleGroup',
      'orderEntries',
      'orderEntries.article',
      'orderEntries.article.articleGroup',
      'annotations',
    ];
  }

  async changed(slip: SlipsheetEntity) {
    if (slip.state !== SlipsheetState.OPEN) {
      await this.update(slip.id, { state: SlipsheetState.CHANGED });
    }
  }

  async generateNumber(
    entityManager: EntityManager = this.slipsheetRepository.manager,
  ): Promise<string> {
    const lastEntry = await entityManager.query(`
    SELECT "Slipsheet"."slipsheetnumber" AS "slipsheetnumber"
    FROM "slipsheet" "Slipsheet" WHERE NOT("Slipsheet"."slipsheetnumber" IS NULL) and "Slipsheet"."slipsheetnumber" not like '%/%'
    ORDER BY CAST("Slipsheet"."slipsheetnumber" as INTEGER) DESC Limit 1`);

    if (lastEntry?.length != 0) {
      const number = +lastEntry[0]?.slipsheetnumber || 0;
      return (number + 1).toString();
    }
    return '1';
  }

  async generateSlipsheet(id: number, close: boolean): Promise<SlipsheetEntity> {
    let slip: SlipsheetEntity = (await this.getAllInformations([id]))[0];
    if (!slip) {
      throw new NotFoundException('Lieferschein nicht gefunden');
    }

    if (slip.orderEntries.length === 0 && slip.annotations.length === 0) {
      throw new UnprocessableEntityException('Keine Eintraege auf Lieferschein');
    }

    if (!slip.path || !slip.slipsheetnumber) {
      const numberAndPath = await this.reserveSlipNumberAndPath(id, close);
      slip.slipsheetnumber = numberAndPath.slipsheetnumber;
      slip.path = numberAndPath.path;
    } else if (close && slip.state !== SlipsheetState.CLOSED) {
      await this.update(id, { state: SlipsheetState.CLOSED });
      slip.state = SlipsheetState.CLOSED;
    }

    if (close) {
      slip.state = SlipsheetState.CLOSED;
    }

    try {
      const contentd = this.pdfMakerService.generateDeliverySlip(slip);
      await this.pdfMakerService.savePDFToFileSystem(
        contentd,
        join(this.appConfigService.pdf_slip_path, slip.path),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }

    slip = (await this.getAllInformations([id]))[0];
    return slip;
  }

  closeAndSetBillId(shoppingcartIds: number[], billId: number): Promise<SlipsheetEntity[]> {
    return this.slipsheetRepository.updateEntities(shoppingcartIds, {
      bill: { id: billId },
      state: SlipsheetState.CLOSED,
    });
  }

  getPathName(slip: SlipsheetEntity): string {
    return 'L_' + slip.slipsheetnumber + '.pdf';
  }

  async findOpenForCustomer(customer: CustomerEntity): Promise<SlipsheetEntity> {
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    let returnSlipsheet = await this.slipsheetRepository.findOneAsync(
      {
        state: SlipsheetState.OPEN,
        customer,
      },
      [
        'customer',
        'orderEntries',
        'orderEntries.article',
        'orderEntries.article.articleGroup',
        'annotations',
      ],
      false,
    );

    if (!returnSlipsheet) {
      returnSlipsheet = await this.slipsheetRepository.createEntity(
        { customer },
        [
          'customer',
          'orderEntries',
          'orderEntries.article',
          'orderEntries.article.articleGroup',
          'annotations',
        ],
      );
    }

    return returnSlipsheet;
  }

  async findFromCustomer(customerId: number, timerange?: TimeRangeDto): Promise<SlipsheetEntity[]> {
    const filter = {
      customer: customerId,
    } as any;

    if (timerange) {
      filter.createdAt = Between(timerange.from, timerange.to);
    }

    return this.slipsheetRepository.findAll({
      filter,
      relations: ['customer', 'orderEntries', 'orderEntries.article', 'orderEntries.article.articleGroup', 'bill', 'annotations'],
    });
  }

  async findByState(state: SlipsheetState): Promise<SlipsheetEntity[]> {
    return this.slipsheetRepository.findAll({
      filter: { state },
      relations: [
        'customer',
        'orderEntries',
        'orderEntries.article',
        'orderEntries.article.articleGroup',
        'bill',
        'annotations',
      ],
    });
  }

  private async reserveSlipNumberAndPath(
    id: number,
    close: boolean,
    maxAttempts = 5,
  ): Promise<{ slipsheetnumber: string; path: string }> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const slipsheetnumber = await this.generateNumber();
      const path = this.getPathName({ slipsheetnumber } as SlipsheetEntity);

      try {
        await this.update(id, {
          slipsheetnumber,
          path,
          ...(close ? { state: SlipsheetState.CLOSED } : {}),
        });

        return { slipsheetnumber, path };
      } catch (error) {
        if (this.isUniqueConstraintError(error) && attempt < maxAttempts) {
          continue;
        }
        throw error;
      }
    }

    throw new InternalServerErrorException(
      'Lieferscheinnummer konnte nicht eindeutig erzeugt werden',
    );
  }

  private isUniqueConstraintError(error: any): boolean {
    const code = error?.code || error?.errno;
    const message = `${error?.message || ''}`.toLowerCase();
    return (
      code === 'SQLITE_CONSTRAINT' ||
      code === '23505' ||
      message.includes('unique constraint')
    );
  }
}
