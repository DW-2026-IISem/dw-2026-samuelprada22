import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { HttpMethod } from '../../../../../common/enums/http-method.enum.js';
import { Status } from '../../../../../common/enums/status.enum.js';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsEnum(HttpMethod)
  method: HttpMethod;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

export class UpdateResourceDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  path?: string;

  @IsOptional()
  @IsEnum(HttpMethod)
  method?: HttpMethod;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
