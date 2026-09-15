import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
