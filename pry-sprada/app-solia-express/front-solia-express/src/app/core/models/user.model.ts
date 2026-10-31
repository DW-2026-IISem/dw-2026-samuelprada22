import { Status, Timestamps } from './api.model';

/** User information returned by the backend. */
export interface User extends Timestamps {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  status: Status;
}

/** Payload used to create a user. */
export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  avatar?: string | null;
  status?: Status;
}

/** Payload used to update a user's profile. */
export interface UpdateUserPayload {
  username: string;
  email: string;
  avatar?: string | null;
}
