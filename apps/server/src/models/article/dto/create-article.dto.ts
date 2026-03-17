import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { IdDto } from '../../../common/dto/id.dto';

export class CreateArticleDto {
  @ApiProperty({
    example: '555555',
    description: 'Name',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'M555555',
    description: 'Barcode',
  })
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: '4.55',
    description: 'Price of one unit',
  })
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: 'Schraube',
    description: 'Type',
  })
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: 'pc',
    description: 'Unit of article',
  })
  @IsNotEmpty()
  unit: string;

  @ApiProperty({
    example: '33234',
    description: 'Article Number from Supplier',
  })
  @IsNotEmpty()
  artNumber: string;

  @ApiProperty({
    type: IdDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => IdDto)
  articleGroup: IdDto;

  @ApiProperty({
    example: 'true',
    description: 'Do not sum up position',
  })
  @IsOptional()
  singlePos: boolean;

  @ApiProperty({
    example: 'true',
    description: 'Do not track the stock',
  })
  @IsOptional()
  trackStock: boolean;

  @ApiProperty({
    example: 'true',
    description: 'no general Discount',
  })
  @IsOptional()
  noDiscount: boolean;
}
