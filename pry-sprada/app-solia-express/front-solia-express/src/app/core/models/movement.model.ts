import { Money, Status, Timestamps } from './api.model';

/** Movement entity returned by the backend. */
export interface Movement extends Timestamps {
  id: number;
  account_id: number;
  reference_id: number | null;
  type: string;
  date: string;
  amount: Money;
  observations: string | null;
  status: Status;
}

export interface MovementPayload {
  account_id: number;
  reference_id?: number | null;
  type: string;
  date: string;
  amount: number;
  observations?: string | null;
  status?: Status;
}

/** Payload used to edit a movement without changing its status. */
export type UpdateMovementPayload = Omit<MovementPayload, 'status'>;
