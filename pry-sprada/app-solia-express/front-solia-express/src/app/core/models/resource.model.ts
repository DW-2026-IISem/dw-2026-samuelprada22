import { Status, Timestamps } from './api.model';

/** HTTP methods accepted by the backend resource catalog. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Protected API resource returned by the backend. */
export interface Resource extends Timestamps {
  id: number;
  method: HttpMethod;
  path: string;
  description: string | null;
  status: Status;
}

export interface ResourcePayload {
  method: HttpMethod;
  path: string;
  description?: string | null;
  status?: Status;
}

/** Payload used to edit a resource without changing its status. */
export type UpdateResourcePayload = Omit<ResourcePayload, 'status'>;
