import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'trinhchin',
    description: 'The name of the User',
  })
  @Length(5, 20)
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    example: 'username',
    description: 'The name of the User',
  })
  @Length(1, 20)
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({
    example: 'trinhchin.innos@gmail.com',
    description: 'The email of the User',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    example: '0password',
    description: 'The password of the User',
  })
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({
    example: '11111111',
    description: 'The referralCode of the User',
  })
  @Length(8, 8)
  @IsNotEmpty()
  readonly referralCode: string;
}
