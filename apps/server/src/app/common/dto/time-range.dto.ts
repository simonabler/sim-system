import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, Length, ValidateNested } from 'class-validator';

export class TimeRangeDto {

  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

}
