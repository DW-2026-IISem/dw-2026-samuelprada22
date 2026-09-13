import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInstallmentDto {
  @ApiProperty({
    example: 1,
    description: 'ID del crédito al que pertenece la cuota',
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  creditId: number;

  @ApiProperty({
    example: 'Cuota mensual',
    description: 'Nombre de la cuota',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Cuota mensual para obligaciones de crédito',
    description: 'Descripción de la cuota',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
