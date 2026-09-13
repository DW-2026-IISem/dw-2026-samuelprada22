import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '../../../../../common/enums/status.enum.js';

export class RateResponseDto {
  @ApiProperty({
    example: 1,
  })
  id: number;

  @ApiProperty({
    example: 'Tasa ordinaria',
    description: 'Nombre de la tasa',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'Tasa de interés ordinaria para operaciones de crédito',
    description: 'Descripción de la tasa',
  })
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si la tasa está activa',
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
