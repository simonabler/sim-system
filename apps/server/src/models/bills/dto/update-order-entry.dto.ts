import { PickType } from '@nestjs/mapped-types';
import { AddOrderEntryDto } from './add-order-entry.dto';

export class UpdateOrderEntryDto extends PickType(AddOrderEntryDto, ['article', 'text', 'price', 'customerRabatt', 'articleGroupRabatt', 'amount'] as const) {

}
