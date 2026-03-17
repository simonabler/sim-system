import { IsDateString } from 'class-validator';

export class TimeRangeDto {

  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

}
