import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateInstallmentDto {
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
