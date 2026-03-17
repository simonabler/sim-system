import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class UpdateBillDto {
  @ApiProperty({
    example: '4',
    description: 'Rechnungsnummer',
  })
  @IsNotEmpty()
  @IsString()
  billNumber: string;

  @ApiProperty({
    example: '2022-01-01',
    description: 'Rechnungsdatum',
  })
  @IsNotEmpty()
  @IsDateString()
  billDate: string;
}
