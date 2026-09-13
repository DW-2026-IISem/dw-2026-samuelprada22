import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '../../../../../common/enums/status.enum.js';

export class CreditApplicationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 1,
    description: 'ID del socio asociado a la solicitud',
  })
  memberId: number;

  @ApiProperty({
    example: '2026-09-11',
    description: 'Fecha de la solicitud de crédito',
  })
  date: Date;

  @ApiProperty({
    example: 1000000,
    description: 'Valor solicitado',
  })
  amount: number;

  @ApiProperty({
    enum: Status,
    example: Status.ACTIVE,
  })
  status: Status;

  @ApiPropertyOptional({
    example: 'Solicitud de crédito para inversión personal',
  })
  observations?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
