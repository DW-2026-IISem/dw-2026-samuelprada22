import {
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';

import { Status } from '../../../../../common/enums/status.enum.js';

export class AssignResourceRoleDto {
  @IsInt()
  resourceId: number;

  @IsInt()
  roleId: number;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  isActive?: boolean;
}
