import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateAnnotationDto {

  @ApiProperty({
    example: 'Kommision',
    description: 'Text input',
  })
  @IsNotEmpty()
  text: string;

}
