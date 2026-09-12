import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Status } from '../../../../../common/enums/status.enum.js';

export class InstallmentPaymentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'Pago de cuota mensual',
    description: 'Nombre del pago de cuota',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Registro de pago correspondiente a una cuota mensual',
    description: 'Descripción del pago de cuota',
  })
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el pago de cuota está activo',
  })
  isActive: boolean;

  @ApiProperty({
    enum: Status,
    example: Status.ACTIVE,
  })
  status: Status;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
