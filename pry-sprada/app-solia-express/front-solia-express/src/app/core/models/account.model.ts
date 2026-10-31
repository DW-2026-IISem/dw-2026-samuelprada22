import { Status, Timestamps } from './api.model';

/** Account entity returned by the backend. */
export interface Account extends Timestamps {
  id: number;
  member_id: number;
  name: string;
  description: string | null;
  status: Status;
}

export interface AccountPayload {
  member_id: number;
  name: string;
  description?: string | null;
  status?: Status;
}

/** Payload used to edit an account without changing its status. */
export type UpdateAccountPayload = Omit<AccountPayload, 'status'>;
