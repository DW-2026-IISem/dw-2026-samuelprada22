
import { Timestamps } from './api.model';

/**
 * Member entity returned by the backend.
 * Table: members
 * Endpoint: /api/members
 */
export interface Member extends Timestamps {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
}

/**
 * Payload used to create a member.
 */
export interface MemberPayload {
  name: string;
  description?: string | null;
  isActive?: boolean;
}

/** Payload used to update a member without changing its active state. */
export type UpdateMemberPayload = Omit<MemberPayload, 'isActive'>;
