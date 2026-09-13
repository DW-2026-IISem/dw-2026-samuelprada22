import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '../../../../../common/enums/status.enum.js';

export class CreditResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la solicitud de crédito asociada',
  })
  creditApplicationId: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la tasa asociada al crédito',
  })
  rateId: number;

  @ApiProperty({
    example: '2026-09-11',
    description: 'Fecha de otorgamiento del crédito',
  })
  date: Date;

  @ApiProperty({
    example: 1000000,
    description: 'Valor del crédito',
  })
  amount: number;

  @ApiProperty({
    enum: Status,
    example: Status.ACTIVE,
  })
  status: Status;

  @ApiPropertyOptional({
    example: 'Crédito aprobado para desarrollo',
    description: 'Observaciones del crédito',
  })
  observations?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
