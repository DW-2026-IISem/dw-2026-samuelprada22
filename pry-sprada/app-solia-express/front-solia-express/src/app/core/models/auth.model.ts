import { Status } from './api.model';

/** Credentials submitted to the login endpoint. */
export interface LoginPayload {
  identifier: string;
  password: string;
}

/** Tokens returned after a successful login or refresh. */
export interface SessionTokens {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
}

/** Authenticated user profile. */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  status: Status;
}

/** Profile endpoint response. */
export interface ProfileResponse {
  user: AuthUser;
}

/** Effective permission granted to the authenticated user. */
export interface EffectivePermission {
  resource_id: number;
  method: string;
  path: string;
  description: string | null;
  role_id: number;
  role_name: string;
}

/** Permissions endpoint response. */
export interface PermissionsResponse {
  permissions: EffectivePermission[];
}

/** Payload used to refresh or log out a session. */
export interface RefreshTokenPayload {
  refresh_token: string;
}
