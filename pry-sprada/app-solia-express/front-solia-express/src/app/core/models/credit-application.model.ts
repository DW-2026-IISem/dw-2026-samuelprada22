import { Money, Timestamps } from './api.model';

export type CreditApplicationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

/** Credit application entity returned by the backend. */
export interface CreditApplication extends Timestamps {
  id: number;
  member_id: number;
  member?: {
    id: number;
    name: string;
  };
  reference_id: number | null;
  date: string;
  amount: Money;
  status: CreditApplicationStatus;
  observations: string | null;
}

export interface CreditApplicationPayload {
  member_id: number;
  reference_id?: number | null;
  date: string;
  amount: number;
  status?: CreditApplicationStatus;
  observations?: string | null;
}

/** Payload used to edit an application without changing its status. */
export type UpdateCreditApplicationPayload = Omit<CreditApplicationPayload, 'status'>;
