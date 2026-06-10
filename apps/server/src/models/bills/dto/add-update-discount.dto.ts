import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { IdDto } from '../../../common/dto/id.dto';

export class CreateUpdateDiscountDto {

  @IsOptional()
  @IsNumber()
  id: number;

  @ApiProperty({
    type: IdDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => IdDto)
  articleGroup: IdDto;

  @IsNotEmpty()
  @IsNumber()
  value: number;

}
