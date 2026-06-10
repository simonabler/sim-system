import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, ValidateIf, ValidateNested } from 'class-validator';
import { IdDto } from '../../../common/dto/id.dto';

export class AddOrderEntryDto {

  @ApiProperty({
    type: IdDto,
    description: 'Article for the order',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => IdDto)
  article: IdDto;

  @ApiProperty({
    type: IdDto,
    description: 'Customer for the order',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => IdDto)
  customer: IdDto;

  @ApiProperty({
    example: 'true',
    description: 'Free text if not put article ',
  })
  @IsOptional()
  text: string;

  @ApiProperty({
    example: '4.3',
    description: 'Free text if not put article ',
  })
  @ValidateIf((o) => !o.article)
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    example: '20',
    description: 'customer rabatt',
  })
  @ValidateIf((o) => !o.article)
  @IsNotEmpty()
  @IsNumber()
  customerRabatt: number;

  @ApiProperty({
    example: '10',
    description: 'article rabatt',
  })
  @ValidateIf((o) => !o.article)
  @IsNotEmpty()
  @IsNumber()
  articleGroupRabatt: number;

  @ApiProperty({
    example: '3',
    description: 'Amount of article which will be added',
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
