import { Status, Timestamps } from './api.model';

export interface RoleUserDetails {
  id: number;
  username: string;
  email: string;
}

export interface RoleSummary {
  id: number;
  name: string;
}

/** User-to-role assignment. */
export interface RoleUser extends Timestamps {
  id: number;
  user_id: number;
  role_id: number;
  status: Status;
  user?: RoleUserDetails | null;
  role?: RoleSummary | null;
}

export interface RoleUserPayload {
  user_id: number;
  role_id: number;
}
