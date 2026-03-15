import { OmitType, PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Length, ValidateIf, ValidateNested } from 'class-validator';
import { IdDto } from '../../../common/dto/id.dto';
import { AddOrderEntryDto } from './add-order-entry.dto';

export class UpdateOrderEntryDto extends PickType(AddOrderEntryDto, ['article', 'text', 'price', 'customerRabatt', 'articleGroupRabatt', 'amount'] as const) {


}
