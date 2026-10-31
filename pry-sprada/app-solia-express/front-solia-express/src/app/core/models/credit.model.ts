
import { Status, Timestamps, Money } from './api.model';

export type CreditStatus = 'active' | 'paid' | 'cancelled';

export interface Credit extends Timestamps {
  id: number;
  credit_application_id: number;
  rate_id: number;
  date: string;
  approved_amount: Money;
  term: number;
  interest_rate: Money;
  status: CreditStatus;
  observations: string | null;
}

export interface CreditPayload {
  credit_application_id: number;
  rate_id: number;
  date: string;
  approved_amount: number;
  term: number;
  interest_rate: number;
  status?: CreditStatus;
  observations?: string | null;
}

/** Payload used to edit a credit without changing its status. */
export type UpdateCreditPayload = Omit<CreditPayload, 'status'>;
