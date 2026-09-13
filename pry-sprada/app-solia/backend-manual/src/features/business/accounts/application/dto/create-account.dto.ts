import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    example: 1,
    description: 'ID del socio propietario de la cuenta',
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  memberId: number;

  @ApiProperty({ example: 'Cuenta de Ahorros' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'Cuenta destinada al ahorro del socio de FondoSolidario',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
