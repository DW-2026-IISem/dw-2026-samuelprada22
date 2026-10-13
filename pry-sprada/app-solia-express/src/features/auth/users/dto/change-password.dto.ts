/**
 * Datos de entrada de `PATCH /api/usuarios/:id/password`.
 *
 * Exige la contraseña actual además de la nueva.
 */
export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}
