import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { OrderEntryRepository } from './order-entry.repository';
import { OrderEntry } from './entities/order-entry.entity';
import { OrderEntryEntity } from './serializers/order-entry.serializer';
import { CustomerEntity } from '../customer/serializers/customer.serializer';
import { SlipsheetEntity } from './serializers/slipsheet.serializer';
import { AddOrderEntryDto } from './dto/add-order-entry.dto';
import { SlipsheetService } from './slipsheet.service';
import { DeepPartial } from 'typeorm';
import { ArticleService } from '../article/article.service';
import { BillService } from './bill.service';

@Injectable()
export class OrderEntryService extends BaseService<OrderEntry, OrderEntryEntity> {

  constructor(
    @InjectRepository(OrderEntryRepository)
    private readonly orderEntryRepository: OrderEntryRepository,
    private readonly slipsheetService: SlipsheetService,
    private readonly billService: BillService,
    private readonly articleServie: ArticleService,
  ) {
    super(orderEntryRepository);
  }


  async addOrderToSlipsheet(
    {
      customer,
      slipsheet = null,
      addOrderEntry

    }: {
      customer: CustomerEntity,
      slipsheet?: SlipsheetEntity,
      addOrderEntry: AddOrderEntryDto,
    }): Promise<OrderEntryEntity> {

    if (!customer && !slipsheet)
      throw new NotFoundException("Customer not found");

    if (!addOrderEntry)
      throw new UnprocessableEntityException("addOrderEntry not found");

    if ((addOrderEntry.article && addOrderEntry.text) || (!addOrderEntry.article && !addOrderEntry.text))
      throw new UnprocessableEntityException("ether article or text has to be set, not both or nothing");

    if (!slipsheet)
      slipsheet = await this.slipsheetService.findOpenForCustomer(customer);

    let ordertoAdd: OrderEntryEntity | DeepPartial<OrderEntry>;

    let retVal = null
    if (addOrderEntry.article) {
      retVal = await this.addEntryByArticle(addOrderEntry, customer, slipsheet);
    } else {
      retVal = this.addEntryByText(addOrderEntry, customer, slipsheet);
    }
    await this.slipsheetService.changed(slipsheet);
    if (slipsheet.billId)
      await this.billService.changed(slipsheet.billId);
    return retVal;
  }


  addEntryByText(addOrderEntry: AddOrderEntryDto, customer: CustomerEntity, slipsheet: SlipsheetEntity): Promise<OrderEntryEntity> {

    const orderEntryEntity: DeepPartial<OrderEntry> = {
      text: addOrderEntry.text,
      price: addOrderEntry.price,
      customerRabatt: addOrderEntry.customerRabatt,
      amount: addOrderEntry.amount,
      articleGroupRabatt: addOrderEntry.articleGroupRabatt,
      slipsheet: slipsheet
    }
    return this.orderEntryRepository.createEntity(orderEntryEntity, ['slipsheet']);

  }

  async addEntryByArticle(addOrderEntry: AddOrderEntryDto, customer: CustomerEntity, slipsheet: SlipsheetEntity): Promise<OrderEntryEntity> {

    const relations = ['article', 'article.articleGroup', 'slipsheet'];
    let article = await this.articleServie.get(addOrderEntry.article.id, ['articleGroup']);
    let order = slipsheet.orderEntries?.find(o => o.article?.id === addOrderEntry.article.id);

    if (article.singlePos || !order) {

      if (addOrderEntry.amount <= 0)
        throw new BadRequestException("Amount <= 0, for new or single position");

      const articleDiscount = customer.discounts?.find(o => o.articleGroupId === article.articleGroup?.id)?.value || 0
      const orderEntryEntity: DeepPartial<OrderEntry> = {
        article: article,
        price: article.price,
        customerRabatt: article.noDiscount ? 0 : customer.customerDiscount,
        amount: addOrderEntry.amount,
        articleGroupRabatt: article.noDiscount ? 0 : articleDiscount,
        text: article.name,
        slipsheet: slipsheet
      }
      return this.orderEntryRepository.createEntity(orderEntryEntity, relations);
    } else {
      if (order.amount + addOrderEntry.amount <= 0)
        throw new BadRequestException("new amount <= 0, update position");


      return this.orderEntryRepository.updateEntity(
        order.id,
        { amount: order.amount + addOrderEntry.amount },
        relations);

    }




  }


  override async update(id: number, inputs: DeepPartial<OrderEntry>): Promise<OrderEntryEntity> {
    const relations = ['article', 'article.articleGroup', 'slipsheet'];
    const orderEntry = await this.orderEntryRepository.get(id, ['slipsheet']);
    if (!orderEntry)
      throw new NotFoundException("OrderEntry not found");


    await this.slipsheetService.changed(orderEntry.slipsheet);

    if (orderEntry.slipsheet.billId)
      await this.billService.changed(orderEntry.slipsheet.billId);

    if (inputs.amount == 0) {
      this.orderEntryRepository.delete(id);
      return null;
    }
    return this.orderEntryRepository.updateEntity(id, inputs, relations);
  }
}

