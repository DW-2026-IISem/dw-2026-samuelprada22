import { Timestamps } from './api.model';

export type CommitteeDecisionType =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'observed';

export type CommitteeDecisionStatus = 'active' | 'cancelled';

/** Committee decision entity returned by the backend. */
export interface CommitteeDecision extends Timestamps {
  id: number;
  credit_application_id: number;
  decision: CommitteeDecisionType;
  decision_date: string | null;
  comments: string | null;
  decided_by: number | null;
  status: CommitteeDecisionStatus;
}

export interface CommitteeDecisionPayload {
  credit_application_id: number;
  decision: CommitteeDecisionType;
  decision_date?: string | null;
  comments?: string | null;
  decided_by?: number | null;
  status?: CommitteeDecisionStatus;
}

/** Payload used to edit a committee decision without changing record status. */
export type UpdateCommitteeDecisionPayload = Omit<CommitteeDecisionPayload, 'status'>;
