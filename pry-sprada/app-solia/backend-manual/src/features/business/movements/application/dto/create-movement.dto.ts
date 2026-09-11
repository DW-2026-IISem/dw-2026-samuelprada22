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

export class CreateMovementDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la cuenta asociada al movimiento',
  })
  @IsInt()
  @IsPositive()
  referenceId: number;

  @ApiProperty({
    example: 'APORTE',
    description: 'Tipo de movimiento',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type: string;

  @ApiProperty({
    example: '2026-09-10',
    description: 'Fecha del movimiento',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 50000,
    description: 'Cantidad monetaria del movimiento',
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    example: 'Aporte inicial del socio',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observations?: string;
}
