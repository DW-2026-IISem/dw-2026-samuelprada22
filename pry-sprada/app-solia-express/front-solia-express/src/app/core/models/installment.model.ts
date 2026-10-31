import { Money, Timestamps } from './api.model';

export type InstallmentStatus =
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'cancelled';

/** Installment entity returned by the backend. */
export interface Installment extends Timestamps {
  id: number;
  credit_id: number;
  number: number;
  due_date: string;
  principal_amount: Money;
  interest_amount: Money;
  total_amount: Money;
  paid_amount: Money;
  status: InstallmentStatus;
}

export interface InstallmentPayload {
  credit_id: number;
  number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  paid_amount?: number;
  status?: InstallmentStatus;
}

/** Payload used to edit an installment without changing its status. */
export type UpdateInstallmentPayload = Omit<InstallmentPayload, 'status'>;
