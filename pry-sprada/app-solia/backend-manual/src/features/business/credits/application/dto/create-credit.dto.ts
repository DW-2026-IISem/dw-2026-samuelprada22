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

export class CreateCreditDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la solicitud de crédito asociada',
  })
  @IsInt()
  @IsPositive()
  referenceId: number;

  @ApiProperty({
    example: '2026-09-11',
    description: 'Fecha de otorgamiento del crédito',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 1000000,
    description: 'Valor otorgado del crédito',
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    example: 'Crédito aprobado para desarrollo',
    description: 'Observaciones del crédito',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  observations?: string;
}
