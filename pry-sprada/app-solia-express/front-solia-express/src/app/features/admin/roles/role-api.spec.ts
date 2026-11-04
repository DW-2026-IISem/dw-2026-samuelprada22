import {
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { Role } from '../../../core/models/role.model';
import { RoleApi } from './role-api';

const BASE = `${environment.apiUrl}/roles`;

const ROLE: Role = {
  id: 1,
  name: 'ADMIN',
  description: 'Administrador del sistema',
  status: 'active',
};

describe('RoleApi', () => {
  let api: RoleApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(RoleApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { roles } into Role[]', () => {
    let result: Role[] | undefined;

    api.list().subscribe((roles) => {
      result = roles;
    });

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('GET');
    request.flush({ roles: [ROLE] });

    expect(result).toEqual([ROLE]);
  });

  it('should unwrap { role } when getting a role', () => {
    let result: Role | undefined;

    api.get(1).subscribe((role) => {
      result = role;
    });

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('GET');
    request.flush({ role: ROLE });

    expect(result).toEqual(ROLE);
  });

  it('should POST a new role', () => {
    const payload = {
      name: 'CAJERO',
      description: 'Operaciones de caja',
      status: 'active' as const,
    };

    let result: Role | undefined;

    api.create(payload).subscribe((role) => {
      result = role;
    });

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({ role: { ...ROLE, ...payload } });

    expect(result).toEqual({ ...ROLE, ...payload });
  });

  it('should PATCH a role without sending status', () => {
    const payload = {
      name: 'ADMINISTRADOR',
      description: 'Administración del sistema',
    };

    let result: Role | undefined;

    api.update(1, payload).subscribe((role) => {
      result = role;
    });

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body).not.toHaveProperty('status');

    request.flush({ role: { ...ROLE, ...payload } });

    expect(result).toEqual({ ...ROLE, ...payload });
  });

  it('should PATCH the deactivate endpoint', () => {
    api.deactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/deactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({ message: 'Role deactivated' });
  });

  it('should DELETE a role', () => {
    api.remove(1).subscribe();

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('DELETE');

    request.flush({ message: 'Role permanently deleted' });
  });

  it('should use environment.apiUrl and the roles endpoint', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(`${environment.apiUrl}/roles`);
    expect(request.request.method).toBe('GET');
    request.flush({ roles: [] });
  });
});
