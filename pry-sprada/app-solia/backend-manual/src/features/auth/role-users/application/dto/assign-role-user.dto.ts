import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Status } from '../../../../../common/enums/status.enum';

export class AssignRoleUserDto {
  @IsInt()
  roleId: number;

  @IsInt()
  userId: number;

  @IsOptional()
  @IsEnum(Status)
  isActive?: Status;
}
