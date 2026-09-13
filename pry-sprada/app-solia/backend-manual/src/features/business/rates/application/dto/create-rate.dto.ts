import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRateDto {
  @ApiProperty({
    example: 'Tasa ordinaria',
    description: 'Nombre de la tasa',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Tasa de interés ordinaria para operaciones de crédito',
    description: 'Descripción de la tasa',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
