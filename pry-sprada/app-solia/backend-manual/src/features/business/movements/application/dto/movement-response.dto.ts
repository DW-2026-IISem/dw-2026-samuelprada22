import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '../../../../../common/enums/status.enum.js';

export class MovementResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la cuenta asociada al movimiento',
  })
  referenceId: number;

  @ApiProperty({
    example: 'APORTE',
    description: 'Tipo de movimiento',
  })
  type: string;

  @ApiProperty({
    example: '2026-09-10',
    description: 'Fecha del movimiento',
  })
  date: Date;

  @ApiProperty({
    example: 50000,
    description: 'Cantidad monetaria del movimiento',
  })
  amount: number;

  @ApiPropertyOptional({
    example: 'Aporte inicial del socio',
  })
  observations?: string;

  @ApiProperty({ enum: Status, example: Status.ACTIVE })
  status: Status;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
