import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class InstallmentFilterDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'ID del crédito al que pertenecen las cuotas',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  creditId?: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({
    example: 'mensual',
    description: 'Texto para buscar en el nombre o descripción de la cuota',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
