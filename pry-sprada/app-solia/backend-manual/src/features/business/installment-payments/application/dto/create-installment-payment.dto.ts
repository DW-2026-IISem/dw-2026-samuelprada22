import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInstallmentPaymentDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la cuota a la que pertenece el pago',
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  installmentId: number;

  @ApiProperty({
    example: 'Pago de cuota mensual',
    description: 'Nombre del pago de cuota',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'Registro de pago correspondiente a una cuota mensual',
    description: 'Descripción del pago de cuota',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
