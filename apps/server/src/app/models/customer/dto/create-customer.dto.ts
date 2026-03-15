import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ICustomer } from '../interfaces/customer.interface';

export class CreateCustomerDto  implements ICustomer{
  
  @ApiProperty({
    example: 'Simon',
    description: 'Firstname',
  })
  @IsOptional()
  firstName: string;

  @ApiProperty({
    example: 'Abler',
    description: 'Lastname',
  })
  @IsOptional()
  lastName: string;

  @ApiProperty({
    example: '00002',
    description: 'Customer number, has to be unique',
  })
  @IsNotEmpty()
  customerNumber: string;
  
  @ApiProperty({
    example: '20',
    description: 'Generall Discount of customer',
  })
  @IsOptional()
  customerDiscount: number = 0;
  
  @ApiProperty({
    example: 'simon.abler@gmail.com',
    description: 'email',
  })
  @IsOptional()
  email: string;
  
  @ApiProperty({
    example: 'Abler gmbh',
    description: 'Company name',
  })
  @IsOptional()
  companyName: string;
  
  @ApiProperty({
    example: 'Musterstraße 4',
    description: 'Adress with Number',
  })
  @IsOptional()
  address: string;
  
  @ApiProperty({
    example: '6020',
    description: 'Postcode',
  })
  @IsOptional()
  postcode: string;
  
  @ApiProperty({
    example: '0000033',
    description: 'Phonenumber company',
  })
  @IsOptional()
  phoneCompany: string;
  
  @ApiProperty({
    example: '00000023',
    description: 'Phonenumber private',
  })
  @IsOptional()
  phonePrivate: string;
  
  @ApiProperty({
    example: 'AT-555422',
    description: 'UID number',
  })
  @IsOptional()
  uid: string;
  
  @ApiProperty({
    example: 'Austria',
    description: 'Country',
  })
  @IsOptional()
  country: string;
}
