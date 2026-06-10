import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { BillRepository } from './bill.repository';
import { BillEntity } from './serializers/bill.serializer';
import { EntityManager } from 'typeorm';
import { BaseService } from '../../common/base.service';
import { Bill } from './entities/bill.entity';
import { SlipsheetEntity } from './serializers/slipsheet.serializer';
import { SlipsheetState } from './enums/slipsheet-state.enum';
import { SlipsheetService } from './slipsheet.service';
import { BillState } from './enums/bill-state.enum';
import { PdfMakerService } from '../../common/services/pdfmaker.service';
import { join } from 'path';
import { AppConfigService } from '../../config/app/config.service';
import { Slipsheet } from './entities/slipsheet.entity';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';

@Injectable()
export class BillService extends BaseService<Bill, BillEntity> {

  constructor(
    private readonly billRepository: BillRepository,
    private readonly slipsheetService: SlipsheetService,
    private readonly pdfMakerService: PdfMakerService,
    private readonly appConfigService: AppConfigService,
  ) {
    super(billRepository);
  }


  async generateBill(
    slipsheetEntities: SlipsheetEntity[],
    bill?: BillEntity,
  ): Promise<BillEntity> {
    if (!slipsheetEntities?.length) {
      throw new BadRequestException('Keine Lieferscheine angegeben');
    }

    const shoppingcartIds = slipsheetEntities.map((o) => o.id);
    const firstCustomerId = slipsheetEntities[0]?.customer?.id;

    if (slipsheetEntities.some((cart) => cart.state !== SlipsheetState.CLOSED))
      throw new BadRequestException('Lieferscheine noch nicht erstellt');

    if (!firstCustomerId || slipsheetEntities.some((cart) => cart.customer?.id !== firstCustomerId))
      throw new BadRequestException('Warenkorb von unterschiedlichen Kunden');

    if (
      slipsheetEntities.some(
        (cart) => !!cart.bill && (!bill || cart.bill.id !== bill.id),
      )
    )
      throw new BadRequestException('Manche Lieferscheine haben schon eine Rechnung');

    let firstBillEntity: BillEntity;
    const createdNewBill = !bill;

    try {
      if (!bill) {
        firstBillEntity = await this.createBillWithRetry();
      } else {
        firstBillEntity = await this.getAllInformations(bill.id);
        if (!firstBillEntity) {
          throw new NotFoundException('Rechnung nicht gefunden');
        }
      }

      firstBillEntity.state = BillState.CLOSED;
      if (!firstBillEntity.path) {
        firstBillEntity.path = this.getPathName(firstBillEntity);
      }

      await this.billRepository.manager.transaction(async (entityManager) => {
        await entityManager.update(Bill, firstBillEntity.id, {
          path: firstBillEntity.path,
          state: firstBillEntity.state,
        });
        await entityManager.update(Slipsheet, shoppingcartIds, {
          billId: firstBillEntity.id,
          state: SlipsheetState.CLOSED,
        });
      });

      firstBillEntity = await this.getAllInformations(firstBillEntity.id);

      await this.writeBillPdf(firstBillEntity);

      return firstBillEntity;

    } catch (error) {
      console.error(error);
      if (createdNewBill && firstBillEntity?.id) {
        await this.rollbackCreatedBill(firstBillEntity.id, shoppingcartIds);
      }

      throw error;
    }
  }

  async regenerateBillPdf(id: number): Promise<BillEntity> {
    const bill = await this.getAllInformations(id);
    if (!bill) {
      throw new NotFoundException('Rechnung nicht gefunden');
    }

    if (bill.state !== BillState.CLOSED) {
      bill.state = BillState.CLOSED;
    }

    if (!bill.path) {
      bill.path = this.getPathName(bill);
    }

    await this.billRepository.updateEntity(bill.id, {
      path: bill.path,
      state: bill.state,
    });

    await this.writeBillPdf(bill);
    return this.getAllInformations(id);
  }

  async updateBill(id: number, inputs: UpdateBillDto): Promise<BillEntity> {
    const existingBill = await this.getAllInformations(id);
    if (!existingBill) {
      throw new NotFoundException('Rechnung nicht gefunden');
    }

    const nextBillNumber = inputs.billNumber?.trim() || existingBill.billNumber;
    const previousPath = existingBill.path;

    await this.billRepository.updateEntity(existingBill.id, {
      billNumber: nextBillNumber,
      billDate: this.normalizeBillDate(inputs.billDate),
      path: this.getPathName({
        ...existingBill,
        billNumber: nextBillNumber,
      } as BillEntity),
    });

    const updatedBill = await this.regenerateBillPdf(id);

    if (previousPath && previousPath !== updatedBill.path) {
      await this.deletePdfFile(previousPath);
    }

    return updatedBill;
  }

  async releaseBill(id: number): Promise<void> {
    const bill = await this.getAllInformations(id);
    if (!bill) {
      throw new NotFoundException('Rechnung nicht gefunden');
    }

    const slipsheetIds = (bill.slipsheets || []).map((slipsheet) => slipsheet.id);

    await this.billRepository.manager.transaction(async (entityManager) => {
      if (slipsheetIds.length) {
        await entityManager.update(Slipsheet, slipsheetIds, {
          billId: null,
          state: SlipsheetState.CLOSED,
        });
      }

      await entityManager.delete(Bill, bill.id);
    });

    await this.deletePdfFile(bill.path);
  }

  getAllInformations(id: number): Promise<BillEntity> {
    return this.get(id,
      [
        'slipsheets',
        'slipsheets.customer',
        'slipsheets.orderEntries',
        'slipsheets.orderEntries.article',
        'slipsheets.orderEntries.article.articleGroup',
        'slipsheets.annotations'],
    );
  }

  getAllAllInformations(): Promise<BillEntity[]> {
    return this.getAll(
      [
        'slipsheets',
        'slipsheets.customer',
        'slipsheets.orderEntries',
        'slipsheets.orderEntries.article',
        'slipsheets.orderEntries.article.articleGroup',
        'slipsheets.annotations'],
    );
  }

  async generateNumber(entityManager: EntityManager = this.billRepository.manager): Promise<string> {
    const lastEntry = await entityManager.query(`
    SELECT "Bill"."billNumber" AS "billNumber"
    FROM "bill" "Bill" WHERE NOT("Bill"."billNumber" IS NULL) and "Bill"."billNumber" not like '%/%'
    ORDER BY CAST("Bill"."billNumber" as INTEGER) DESC Limit 1`);
    if (lastEntry?.length != 0) {
      const number = +lastEntry[0]?.billNumber || 0;
      return (number + 1).toString();
    } else {
      return '1';
    }
  }

  getPathName(bill: BillEntity): string {
    return 'R_' + bill.billNumber + '.pdf';
  }


  async findFromCustomer(customerId: number): Promise<BillEntity[]> {
    const bills = await this.billRepository
      .createQueryBuilder('bill')
      .leftJoinAndSelect('bill.slipsheets', 'slipsheet')
      .leftJoinAndSelect('slipsheet.customer', 'customer')
      .leftJoinAndSelect('slipsheet.orderEntries', 'orderEntries')
      .leftJoinAndSelect('orderEntries.article', 'article')
      .leftJoinAndSelect('article.articleGroup', 'articleGroup')
      .leftJoinAndSelect('slipsheet.annotations', 'annotations')
      .where('slipsheet.customerId = :customerId', { customerId })
      .getMany();

    return this.billRepository.transformMany(bills);
  }

  async findByState(state: BillState): Promise<BillEntity[]> {
    return this.billRepository.findAll({
      filter: { state },
      relations: [
        'slipsheets',
        'slipsheets.customer',
        'slipsheets.orderEntries',
        'slipsheets.orderEntries.article',
        'slipsheets.orderEntries.article.articleGroup',
        'slipsheets.annotations',
      ],
    });
  }


  async changed(billId: number) {
    return this.update(billId, { state: BillState.OPEN });
  }

  private async createBillWithRetry(maxAttempts = 5): Promise<BillEntity> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const billNumber = await this.generateNumber();
      try {
        const bill = await this.billRepository.createEntity({
          billNumber,
          billDate: new Date(),
          path: this.getPathName({ billNumber } as BillEntity),
          state: BillState.CLOSED,
        });
        return bill;
      } catch (error) {
        if (this.isUniqueConstraintError(error) && attempt < maxAttempts) {
          continue;
        }
        throw error;
      }
    }
    throw new InternalServerErrorException(
      'Rechnungsnummer konnte nicht eindeutig erzeugt werden',
    );
  }

  private async rollbackCreatedBill(
    billId: number,
    slipsheetIds: number[],
  ): Promise<void> {
    try {
      await this.billRepository.manager.transaction(async (entityManager) => {
        await entityManager
          .createQueryBuilder()
          .update(Slipsheet)
          .set({ billId: null })
          .where('id IN (:...ids)', { ids: slipsheetIds })
          .andWhere('billId = :billId', { billId })
          .execute();
        await entityManager.delete(Bill, billId);
      });
    } catch (rollbackError) {
      console.error('Rollback created bill failed', rollbackError);
    }
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

  private normalizeBillDate(value: string | Date): Date {
    if (value instanceof Date) {
      return value;
    }

    const [year, month, day] = `${value || ''}`.split('-').map((part) => +part);
    if (year && month && day) {
      return new Date(year, month - 1, day, 12, 0, 0, 0);
    }

    return new Date(value);
  }

  private async writeBillPdf(bill: BillEntity): Promise<void> {
    const retpdf = await this.pdfMakerService.generateBill(bill);
    await this.pdfMakerService.savePDFToFileSystem(
      retpdf,
      join(this.appConfigService.pdf_bill_path, bill.path),
    );
  }

  private async deletePdfFile(path?: string | null): Promise<void> {
    if (!path) {
      return;
    }

    const filepath = join(this.appConfigService.pdf_bill_path, path);
    if (!existsSync(filepath)) {
      return;
    }

    try {
      await unlink(filepath);
    } catch (error) {
      console.error('Delete bill PDF failed', error);
    }
  }

}
