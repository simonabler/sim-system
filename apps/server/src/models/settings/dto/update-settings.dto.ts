import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BankAccountDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  iban: string;

  @ApiProperty()
  @IsString()
  bic: string;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firmenbuchnummer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vatId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  issueCity?: string;

  @ApiPropertyOptional({ enum: ['generated', 'disabled', 'template_pdf'] })
  @IsOptional()
  @IsIn(['generated', 'disabled', 'template_pdf'])
  letterheadMode?: 'generated' | 'disabled' | 'template_pdf';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  vatRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  paymentTermDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentFooterText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  printDeliverySlipLetterhead?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  printerName?: string;

  @ApiPropertyOptional({ type: [BankAccountDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BankAccountDto)
  bankAccounts?: BankAccountDto[];
}
