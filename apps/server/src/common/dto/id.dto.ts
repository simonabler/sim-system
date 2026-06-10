import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class IdDto {
  @ApiProperty({
    example: '1',
    description: 'ID',
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
