import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ICustomer } from '../interfaces/customer.interface';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto  extends CreateCustomerDto{

}
