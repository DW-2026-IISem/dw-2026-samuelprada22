/**
 * Cantidad de registros por feature/entidad.
 *
 * Prioridad:
 * CLI (--members=N) > env (SEED_MEMBERS) > defaults.
 */
export type SeedCounts = {
  members: number;
  accounts: number;
  movements: number;
  credit_applications: number;
  credits: number;
  rates: number;
  installments: number;
  installment_payments: number;
  committee_decisions: number;
  audits: number;
};

export const DEFAULT_SEED_COUNTS: SeedCounts = {
  members: 10,
  accounts: 10,
  movements: 15,
  credit_applications: 10,
  credits: 10,
  rates: 10,
  installments: 20,
  installment_payments: 20,
  committee_decisions: 10,
  audits: 25,
};

export function resolveSeedCounts(
  argv: string[] = process.argv.slice(2)
): SeedCounts {
  const counts: SeedCounts = { ...DEFAULT_SEED_COUNTS };
  const keys = Object.keys(counts) as (keyof SeedCounts)[];

  // Primero se aplican las variables de entorno.
  for (const key of keys) {
    const envName = `SEED_${key.toUpperCase()}`;
    const rawValue = process.env[envName];

    if (rawValue !== undefined && rawValue.trim() !== "") {
      const value = Number(rawValue);

      if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error(`${envName} debe ser un entero mayor o igual a 0`);
      }

      counts[key] = value;
    }
  }

  // Los argumentos CLI tienen prioridad sobre las variables de entorno.
  for (const arg of argv) {
    const match = arg.match(/^--([a-zA-Z_]+)=(\d+)$/);

    if (!match) continue;

    const key = match[1] as keyof SeedCounts;

    if (!keys.includes(key)) continue;

    const value = Number(match[2]);

    if (!Number.isSafeInteger(value)) {
      throw new Error(`Cantidad no válida para --${key}`);
    }

    counts[key] = value;
  }

  return counts;
}
