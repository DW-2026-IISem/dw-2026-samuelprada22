import { Status, Timestamps } from './api.model';

export interface ResourceRoleSummary {
  id: number;
  name: string;
}

export interface ResourceSummary {
  id: number;
  method: string;
  path: string;
  description: string | null;
}

/** Resource permissions assigned to a role. */
export interface ResourceRole extends Timestamps {
  id: number;
  role_id: number;
  resource_id: number;
  status: Status;
  role?: ResourceRoleSummary | null;
  resource?: ResourceSummary | null;
}

export interface ResourceRolePayload {
  role_id: number;
  resource_id: number;
}

export interface ReconcileResourceRoleResult {
  role_id: number;
  activated: number;
  deactivated: number;
  total_active: number;
}
