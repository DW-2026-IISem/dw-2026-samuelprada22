import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AuditFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  accion?: string;

  @IsOptional()
  @IsString()
  entidad?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  entidadId?: number;
}
