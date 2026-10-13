/**
 * Datos de entrada de `PUT /api/recursos/:id` (reemplazo completo).
 * `status` no está aquí: el estado solo cambia con el borrado lógico.
 */
export interface UpdateResourceDto {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description?: string | null;
}
