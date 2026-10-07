/**
 * Piezas reutilizables de OpenAPI para las tres modalidades de acceso.
 */

/** Esquema de seguridad (RFC 6750: Authorization: Bearer <token>). */
export const bearerSecurityScheme = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description:
      "Access token JWT obtenido en `POST /api/sesion/login`. Enviar como " +
      "`Authorization: Bearer <access_token>`. Vida útil corta (por defecto 15 min); " +
      "se renueva con `POST /api/sesion/refresh`.",
  },
};

/** security de un endpoint OPEN. */
export const openSecurity: unknown[] = [];

/** security de un endpoint JWT o RBAC. */
export const bearerSecurity = [{ bearerAuth: [] }];

/** Respuesta 401. */
export const unauthorizedResponse = {
  description:
    "401 No autenticado — falta el Bearer token, el token es inválido/expiró o el usuario está inactivo",
};

/** Respuesta 403. */
export const forbiddenResponse = {
  description:
    "403 Prohibido — autenticado, pero sin concesión activa para esta operación (deny by default)",
};

/** Respuesta 400 ante un :id inválido. */
export const invalidIdResponse = {
  description: "400 id inválido (debe ser un entero positivo)",
};

/** Respuesta 404 estándar. */
export const notFoundResponse = {
  description: "404 No encontrado",
};
