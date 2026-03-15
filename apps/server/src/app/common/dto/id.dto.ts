import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Length, ValidateNested } from 'class-validator';

export class IdDto  {
  @ApiProperty({
    example: '1',
    description: 'ID',
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
