import { Timestamps } from './api.model';
import type { CreditApplication } from './credit-application.model';

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

/** Payload used to register a committee decision. */
export interface CommitteeDecisionPayload {
  credit_application_id: number;
  decision: CommitteeDecisionType;
  decision_date?: string | null;
  comments?: string | null;
  decided_by?: number | null;
}

/** Payload used to edit a decision without changing its status. */
export type UpdateCommitteeDecisionPayload =
  Partial<CommitteeDecisionPayload>;
