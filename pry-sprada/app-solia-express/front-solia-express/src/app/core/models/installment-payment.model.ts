
import { Timestamps, Money } from './api.model';

export type PaymentMethod = 'cash' | 'transfer' | 'deposit' | 'other';

export type InstallmentPaymentStatus = 'active' | 'cancelled';

export interface InstallmentPayment extends Timestamps {
  id: number;
  installment_id: number;
  payment_date: string;
  amount: Money;
  reference: string | null;
  method: PaymentMethod;
  status: InstallmentPaymentStatus;
}

export interface InstallmentPaymentPayload {
  installment_id: number;
  payment_date: string;
  amount: number;
  reference?: string | null;
  method: PaymentMethod;
  status?: InstallmentPaymentStatus;
}

/** Payload used to edit a payment without changing its status. */
export type UpdateInstallmentPaymentPayload = Omit<InstallmentPaymentPayload, 'status'>;
