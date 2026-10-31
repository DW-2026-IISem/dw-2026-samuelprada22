import { Status, Timestamps } from './api.model';

/** Role entity returned by the backend. */
export interface Role extends Timestamps {
  id: number;
  name: string;
  description: string | null;
  status: Status;
}

export interface RolePayload {
  name: string;
  description?: string | null;
  status?: Status;
}

/** Payload used to edit a role without changing its status. */
export type UpdateRolePayload = Omit<RolePayload, 'status'>;
