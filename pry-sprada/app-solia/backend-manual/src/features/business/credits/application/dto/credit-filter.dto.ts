import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreditFilterDto {
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
    example: 'desarrollo',
    description: 'Texto para buscar en las observaciones del crédito',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la solicitud de crédito asociada',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  referenceId?: number;
}
