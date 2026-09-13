import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '../../../../../common/enums/status.enum.js';

export class AccountResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: 1,
    description: 'ID del socio propietario de la cuenta',
  })
  memberId: number;

  @ApiProperty({ example: 'Cuenta de Ahorros' })
  name: string;

  @ApiPropertyOptional({
    example: 'Cuenta destinada al ahorro del socio de FondoSolidario',
  })
  description?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ enum: Status, example: Status.ACTIVE })
  status: Status;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
