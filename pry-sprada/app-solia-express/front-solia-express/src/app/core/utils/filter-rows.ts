/**
 * Filtro local reutilizable para tablas PrimeNG 22.
 *
 * Filtra el arreglo antes de entregarlo a [value].
 * Es una función pura, independiente del DOM, Angular y la tabla.
 */
export function filterRows<T>(
  rows: readonly T[],
  query: string,
  pick: (row: T) => Array<string | number | null | undefined>,
): T[] {
  const term = query.trim().toLowerCase();

  // Devuelve una copia para no modificar el arreglo original del signal.
  if (!term) {
    return [...rows];
  }

  return rows.filter((row) =>
    pick(row).some((value) =>
      (value ?? '').toString().toLowerCase().includes(term),
    ),
  );
}
