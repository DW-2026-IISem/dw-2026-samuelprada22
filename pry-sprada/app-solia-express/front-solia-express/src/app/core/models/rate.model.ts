
import { Status, Timestamps, Money } from './api.model';

/**
 * Interest rate entity returned by the backend.
 * Table: rates
 * Endpoint: /api/rates
 */
export interface Rate extends Timestamps {
  id: number;
  name: string;
  percentage: Money;
  type: 'monthly' | 'annual';
  description: string | null;
  status: Status;
}

export interface RatePayload {
  name: string;
  percentage: number;
  type: 'monthly' | 'annual';
  description?: string | null;
  status?: Status;
}

/** Payload used to edit a rate without changing its status. */
export type UpdateRatePayload = Omit<RatePayload, 'status'>;
