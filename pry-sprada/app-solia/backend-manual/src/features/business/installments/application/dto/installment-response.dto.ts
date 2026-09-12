import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '../../../../../common/enums/status.enum.js';

export class InstallmentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 'Cuota mensual',
    description: 'Nombre de la cuota',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Cuota mensual para obligaciones de crédito',
    description: 'Descripción de la cuota',
  })
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si la cuota está activa',
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
