import { Injectable, MethodNotAllowedException } from '@nestjs/common';
import { CreateUpdateDiscountDto } from './dto/add-update-discount.dto';
import { BaseService } from '../../common/base.service';
import { Discount } from './entities/discount.entity';
import { DiscountEntity } from './serializers/discount.serializer';
import { DiscountRepository } from './discount.repository';
import { CustomerEntity } from '../customer/serializers/customer.serializer';

@Injectable()
export class DiscountService extends BaseService<Discount, DiscountEntity> {

  constructor(
    private readonly discountRepository: DiscountRepository,
  ) {
    super(discountRepository);
  }

  async createOrUpdate(customer: CustomerEntity, createUpdateDiscountDto: CreateUpdateDiscountDto): Promise<DiscountEntity> {

    let ret;
    if (createUpdateDiscountDto.id) {
      let dbEntity = await this.get(createUpdateDiscountDto.id);
      if (dbEntity.articleGroupId != createUpdateDiscountDto.articleGroup.id)
        throw new MethodNotAllowedException('Artikel Gruppe darf nicht geändert werden');

      ret = await this.update(createUpdateDiscountDto.id, { value: createUpdateDiscountDto.value });
    } else {
      const discount = new Discount();
      discount.articleGroupId = createUpdateDiscountDto.articleGroup.id;
      discount.customerId = customer.id;
      discount.value = createUpdateDiscountDto.value;
      ret = await this.create(discount);
    }

    return this.get(ret.id, ['articleGroup']);
  }

}
