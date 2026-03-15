import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Length, IsOptional, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    required: false,
    description: 'The name of the User ',
  })
  @Length(5, 20)
  @IsOptional()
  readonly name: string;

  @ApiProperty({
    required: false,
    description: 'The email',
  })
  @IsEmail()
  @IsOptional()
  readonly email: string;

  @ApiProperty({
    required: false,
    description: 'The referralCode of the User',
  })
  @Length(8, 8)
  @IsOptional()
  readonly referralCode: string;
}
