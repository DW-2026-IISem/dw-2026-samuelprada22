import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAuditDto {
  @IsInt()
  @Min(1)
  actorUserId: number;

  @IsString()
  @IsNotEmpty()
  accion: string;

  @IsString()
  @IsNotEmpty()
  entidad: string;

  @IsInt()
  @Min(1)
  entidadId: number;

  @IsOptional()
  @IsString()
  datos?: string;
}
