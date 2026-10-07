/**
 * Coincidencia entre la ruta de una petición y un recurso almacenado.
 *
 * Un recurso se guarda como patrón (method + path con parámetros).
 *
 * Ejemplo:
 * GET /api/productos/:id
 *
 * Y la petición real:
 * GET /api/productos/42
 *
 * Reglas:
 * - El verbo HTTP debe coincidir.
 * - Un segmento :param coincide con un solo segmento.
 * - Los demás segmentos deben coincidir exactamente.
 * - La cantidad de segmentos debe ser igual.
 */

/** Normaliza una ruta: sin query string, hash, barra final ni barras duplicadas. */
export function normalizePath(path: string): string {
  const withoutQuery = path.split("?")[0].split("#")[0];
  const single = withoutQuery.replace(/\/{2,}/g, "/");
  const trimmed = single.replace(/\/+$/, "");

  return trimmed === "" ? "/" : trimmed;
}

/** true si path concreto coincide con pattern que puede contener :param. */
export function pathMatches(pattern: string, path: string): boolean {
  const patternParts = normalizePath(pattern).split("/");
  const pathParts = normalizePath(path).split("/");

  if (patternParts.length !== pathParts.length) return false;

  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];

    if (p.startsWith(":")) continue;

    if (p !== pathParts[i]) return false;
  }

  return true;
}

/**
 * true si los recursos concedidos permiten ejecutar la operación solicitada.
 *
 * Deny by default:
 * si ningún recurso coincide, devuelve false.
 */
export function isOperationGranted(
  granted: ReadonlyArray<{ method: string; path: string }>,
  method: string,
  path: string
): boolean {
  const upper = method.toUpperCase();

  return granted.some(
    (resource) =>
      resource.method.toUpperCase() === upper &&
      pathMatches(resource.path, path)
  );
}
