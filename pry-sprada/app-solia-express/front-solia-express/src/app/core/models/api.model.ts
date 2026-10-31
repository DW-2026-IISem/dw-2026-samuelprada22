export type Status = 'active' | 'inactive';

export type Money = number | string;

export interface ApiError {
  error: string;
  detail?: string;
}

/** Minimal shape of Sequelize objects returned by the backend. */
export interface Timestamps {
  createdAt?: string;
  updatedAt?: string;
}

export function toNumber(value: Money | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
