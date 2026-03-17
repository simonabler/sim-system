import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateArticleGroupDto {
  @ApiProperty({
    example: 'Schrauben',
    description: 'Name of group',
  })
  @IsNotEmpty()
  name: string;
}
