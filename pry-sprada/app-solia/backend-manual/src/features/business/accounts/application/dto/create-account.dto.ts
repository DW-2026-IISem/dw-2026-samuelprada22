import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: 'Cuenta de Ahorros' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'Cuenta destinada al ahorro de los socios de FondoSolidario',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
