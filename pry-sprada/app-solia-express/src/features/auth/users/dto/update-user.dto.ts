/**
 * Datos de entrada de `PUT /api/usuarios/:id`.
 *
 * Ni `password` ni `status` están aquí:
 * - password tiene su propia operación;
 * - status cambia mediante borrado lógico.
 */
export interface UpdateUserDto {
  username: string;
  email: string;
  avatar?: string | null;
}
