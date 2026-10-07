import { RoleUser, RoleUserI } from "../role-user.model";

/**
 * Respuesta HTTP de una asignación usuario-rol.
 */
export interface RoleUserResponseDto extends RoleUserI {
  user?: {
    id: number;
    username: string;
    email: string;
  } | null;

  role?: {
    id: number;
    name: string;
  } | null;
}

/**
 * Convierte el modelo Sequelize a DTO de respuesta.
 */
export function toRoleUserResponse(
  roleUser: RoleUser
): RoleUserResponseDto {
  return roleUser.toJSON() as RoleUserResponseDto;
}
