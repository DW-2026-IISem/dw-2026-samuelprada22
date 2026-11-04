import '@angular/compiler';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import {
  AuthUser,
  EffectivePermission,
  SessionTokens,
} from '../../core/models/auth.model';
import { AuthApi } from './auth-api';

const BASE = `${environment.apiUrl}/sesion`;

const TOKENS: SessionTokens = {
  access_token: 'access-token-test',
  token_type: 'Bearer',
  expires_in: 900,
  refresh_token: 'refresh-token-test',
  refresh_expires_in: 604800,
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

describe('AuthApi', () => {
  let api: AuthApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(AuthApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should send credentials to the login endpoint', () => {
    const payload = {
      identifier: 'admin',
      password: 'test-password',
    };

    let result: SessionTokens | undefined;

    api.login(payload).subscribe((tokens) => {
      result = tokens;
    });

    const request = http.expectOne(`${BASE}/login`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(TOKENS);

    expect(result).toEqual(TOKENS);
  });

  it('should send the refresh token to the refresh endpoint', () => {
    const payload = { refresh_token: TOKENS.refresh_token };

    let result: SessionTokens | undefined;

    api.refresh(payload).subscribe((tokens) => {
      result = tokens;
    });

    const request = http.expectOne(`${BASE}/refresh`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(TOKENS);

    expect(result).toEqual(TOKENS);
  });

  it('should send the refresh token to the logout endpoint', () => {
    const payload = { refresh_token: TOKENS.refresh_token };
    const response = { message: 'Session closed' };

    let result: unknown;

    api.logout(payload).subscribe((value) => {
      result = value;
    });

    const request = http.expectOne(`${BASE}/logout`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(response);

    expect(result).toEqual(response);
  });

  it('should unwrap { user } when requesting the profile', () => {
    let result: AuthUser | undefined;

    api.profile().subscribe((user) => {
      result = user;
    });

    const request = http.expectOne(`${BASE}/perfil`);

    expect(request.request.method).toBe('GET');

    request.flush({ user: USER });

    expect(result).toEqual(USER);
  });

  it('should unwrap { permissions } when requesting permissions', () => {
    let result: EffectivePermission[] | undefined;

    api.permissions().subscribe((permissions) => {
      result = permissions;
    });

    const request = http.expectOne(`${environment.apiUrl}/permisos`);

    expect(request.request.method).toBe('GET');

    request.flush({ permissions: [PERMISSION] });

    expect(result).toEqual([PERMISSION]);
  });
});
