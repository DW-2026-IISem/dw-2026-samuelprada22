import '@angular/compiler';

import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthApi } from '../../features/auth/auth-api';
import {
  AuthUser,
  EffectivePermission,
  SessionTokens,
} from '../models/auth.model';
import { AuthSession } from './auth-session';

const STORAGE_KEY = 'solia.session.v1';

const TOKENS: SessionTokens = {
  access_token: 'access-token-test',
  token_type: 'Bearer',
  expires_in: 900,
  refresh_token: 'refresh-token-test',
  refresh_expires_in: 604800,
};

const REFRESHED_TOKENS: SessionTokens = {
  ...TOKENS,
  access_token: 'new-access-token',
  refresh_token: 'new-refresh-token',
};

const USER: AuthUser = {
  id: 1,
  username: 'admin',
  email: 'admin@fondosolidario.test',
  avatar: null,
  status: 'active',
};

const PERMISSION: EffectivePermission = {
  resource_id: 1,
  method: 'GET',
  path: '/api/members',
  description: 'Consultar socios',
  role_id: 1,
  role_name: 'Administrador',
};

const authApiMock = {
  login: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  profile: vi.fn(),
  permissions: vi.fn(),
};

describe('AuthSession', () => {
  let session: AuthSession;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    vi.resetAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AuthSession,
        {
          provide: AuthApi,
          useValue: authApiMock,
        },
      ],
    });

    session = TestBed.inject(AuthSession);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('should authenticate and load the user profile and permissions', () => {
    authApiMock.login.mockReturnValue(of(TOKENS));
    authApiMock.profile.mockReturnValue(of(USER));
    authApiMock.permissions.mockReturnValue(of([PERMISSION]));

    let result:
      | { user: AuthUser; permissions: EffectivePermission[] }
      | undefined;

    session.login({
      identifier: 'admin',
      password: 'test-password',
    }).subscribe((value) => {
      result = value;
    });

    expect(authApiMock.login).toHaveBeenCalledWith({
      identifier: 'admin',
      password: 'test-password',
    });
    expect(authApiMock.profile).toHaveBeenCalledOnce();
    expect(authApiMock.permissions).toHaveBeenCalledOnce();

    expect(result).toEqual({
      user: USER,
      permissions: [PERMISSION],
    });

    expect(session.accessToken()).toBe(TOKENS.access_token);
    expect(session.refreshToken()).toBe(TOKENS.refresh_token);
    expect(session.user()).toEqual(USER);
    expect(session.permissions()).toEqual([PERMISSION]);
    expect(session.isAuthenticated()).toBe(true);
  });

  it('should persist the authenticated session', () => {
    authApiMock.login.mockReturnValue(of(TOKENS));
    authApiMock.profile.mockReturnValue(of(USER));
    authApiMock.permissions.mockReturnValue(of([PERMISSION]));

    session.login({
      identifier: 'admin',
      password: 'test-password',
    }).subscribe();

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '{}',
    );

    expect(stored).toEqual({
      accessToken: TOKENS.access_token,
      refreshToken: TOKENS.refresh_token,
      user: USER,
      permissions: [PERMISSION],
    });
  });

  it('should restore a previously persisted session', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: TOKENS.access_token,
        refreshToken: TOKENS.refresh_token,
        user: USER,
        permissions: [PERMISSION],
      }),
    );

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AuthSession,
        {
          provide: AuthApi,
          useValue: authApiMock,
        },
      ],
    });

    session = TestBed.inject(AuthSession);

    expect(session.accessToken()).toBe(TOKENS.access_token);
    expect(session.refreshToken()).toBe(TOKENS.refresh_token);
    expect(session.user()).toEqual(USER);
    expect(session.permissions()).toEqual([PERMISSION]);
    expect(session.isAuthenticated()).toBe(true);
  });

  it('should load the profile before ensuring an existing access token', () => {
    session.setTokens(TOKENS);

    authApiMock.profile.mockReturnValue(of(USER));
    authApiMock.permissions.mockReturnValue(of([PERMISSION]));

    let result: string | undefined;

    session.ensureAccessToken().subscribe((token) => {
      result = token;
    });

    expect(authApiMock.profile).toHaveBeenCalledOnce();
    expect(authApiMock.permissions).toHaveBeenCalledOnce();
    expect(result).toBe(TOKENS.access_token);
    expect(session.user()).toEqual(USER);
  });

  it('should refresh tokens when the access token is missing', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: '',
        refreshToken: TOKENS.refresh_token,
        user: USER,
        permissions: [PERMISSION],
      }),
    );

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AuthSession,
        {
          provide: AuthApi,
          useValue: authApiMock,
        },
      ],
    });

    session = TestBed.inject(AuthSession);
    authApiMock.refresh.mockReturnValue(of(REFRESHED_TOKENS));

    let result: string | undefined;

    session.ensureAccessToken().subscribe((token) => {
      result = token;
    });

    expect(authApiMock.refresh).toHaveBeenCalledWith({
      refresh_token: TOKENS.refresh_token,
    });
    expect(result).toBe(REFRESHED_TOKENS.access_token);
    expect(session.refreshToken()).toBe(REFRESHED_TOKENS.refresh_token);
  });

  it('should reject access when no session exists', () => {
    let receivedError: unknown;

    session.ensureAccessToken().subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    expect(receivedError).toBeInstanceOf(Error);
    expect(authApiMock.refresh).not.toHaveBeenCalled();
  });

  it('should clear the session when login fails', () => {
    authApiMock.login.mockReturnValue(
      throwError(() => new Error('Invalid credentials')),
    );

    session.setTokens(TOKENS);

    let receivedError: unknown;

    session.login({
      identifier: 'admin',
      password: 'wrong-password',
    }).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    expect(receivedError).toBeInstanceOf(Error);
    expect(session.accessToken()).toBeNull();
    expect(session.refreshToken()).toBeNull();
    expect(session.user()).toBeNull();
    expect(session.permissions()).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should clear local state and request logout with the refresh token', () => {
    session.setTokens(TOKENS);
    session.setAccess({
      user: USER,
      permissions: [PERMISSION],
    });

    authApiMock.logout.mockReturnValue(of({ message: 'Session closed' }));

    session.logout().subscribe();

    expect(authApiMock.logout).toHaveBeenCalledWith({
      refresh_token: TOKENS.refresh_token,
    });

    expect(session.accessToken()).toBeNull();
    expect(session.refreshToken()).toBeNull();
    expect(session.user()).toBeNull();
    expect(session.permissions()).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
