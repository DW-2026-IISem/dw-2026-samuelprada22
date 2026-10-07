/**
 * Datos de entrada de `POST /api/recursos`.
 *
 * `path` se guarda con el patrón (`/api/productos/:id`), no con un valor concreto.
 */
export interface CreateResourceDto {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description?: string | null;
  status?: "active" | "inactive";
}
