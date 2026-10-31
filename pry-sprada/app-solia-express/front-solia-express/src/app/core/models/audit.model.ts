/** Audit record returned by the backend. */
export interface Audit {
  id: number;
  actor_user_id: number;
  action: string;
  entity: string;
  entity_id: number;
  data: string | null;
  createdAt?: string;
}
