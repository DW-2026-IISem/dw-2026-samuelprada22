import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { RoleUser } from '../../../core/models/role-user.model';
import { RoleUserApi } from './role-user-api';

const BASE = `${environment.apiUrl}/asignaciones-rol`;

const ASSIGNMENT: RoleUser = {
  id: 1,
  user_id: 2,
  role_id: 1,
  status: 'active',
  user: {
    id: 2,
    username: 'admin',
    email: 'admin@solia.test',
  },
  role: {
    id: 1,
    name: 'ADMIN',
  },
};

describe('RoleUserApi', () => {
  let api: RoleUserApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(RoleUserApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { assignments } into RoleUser[]', () => {
    let result: RoleUser[] | undefined;

    api.list().subscribe((assignments) => {
      result = assignments;
    });

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('GET');

    request.flush({ assignments: [ASSIGNMENT] });

    expect(result).toEqual([ASSIGNMENT]);
  });

  it('should unwrap { assignment } when getting an assignment', () => {
    let result: RoleUser | undefined;

    api.get(1).subscribe((assignment) => {
      result = assignment;
    });

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('GET');

    request.flush({ assignment: ASSIGNMENT });

    expect(result).toEqual(ASSIGNMENT);
  });

  it('should POST a role assignment', () => {
    const payload = {
      user_id: 2,
      role_id: 1,
    };

    let result: RoleUser | undefined;

    api.create(payload).subscribe((assignment) => {
      result = assignment;
    });

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({ assignment: ASSIGNMENT });

    expect(result).toEqual(ASSIGNMENT);
  });

  it('should PATCH the deactivate endpoint', () => {
    api.deactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/deactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Role assignment deactivated',
      assignment: { ...ASSIGNMENT, status: 'inactive' },
    });
  });

  it('should PATCH the reactivate endpoint', () => {
    api.reactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/reactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Role assignment reactivated',
      assignment: ASSIGNMENT,
    });
  });

  it('should use environment.apiUrl and the asignaciones-rol endpoint', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(
      `${environment.apiUrl}/asignaciones-rol`,
    );
    expect(request.request.method).toBe('GET');

    request.flush({ assignments: [] });
  });
});
