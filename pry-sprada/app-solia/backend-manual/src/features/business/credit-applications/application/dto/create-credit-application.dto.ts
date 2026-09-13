import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCreditApplicationDto {
  @ApiProperty({
    example: 1,
    description: 'ID del socio que realiza la solicitud de crédito',
  })
  @IsInt()
  @IsPositive()
  memberId: number;

  @ApiProperty({
    example: '2026-09-11',
    description: 'Fecha de la solicitud de crédito',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 1000000,
    description: 'Valor solicitado en el crédito',
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    example: 'Solicitud de crédito para inversión personal',
    description: 'Observaciones de la solicitud',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  observations?: string;
}
