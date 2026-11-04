import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { ResourceRole } from '../../../core/models/resource-role.model';
import { ResourceRoleApi } from './resource-role-api';

const BASE = `${environment.apiUrl}/concesiones-rol`;

const GRANT: ResourceRole = {
  id: 1,
  role_id: 1,
  resource_id: 2,
  status: 'active',
  role: {
    id: 1,
    name: 'ADMIN',
  },
  resource: {
    id: 2,
    method: 'GET',
    path: '/api/usuarios',
    description: 'Listar usuarios',
  },
};

describe('ResourceRoleApi', () => {
  let api: ResourceRoleApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(ResourceRoleApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { grants } into ResourceRole[]', () => {
    let result: ResourceRole[] | undefined;

    api.list().subscribe((grants) => {
      result = grants;
    });

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('GET');

    request.flush({ grants: [GRANT] });

    expect(result).toEqual([GRANT]);
  });

  it('should unwrap { grant } when getting a grant', () => {
    let result: ResourceRole | undefined;

    api.get(1).subscribe((grant) => {
      result = grant;
    });

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('GET');

    request.flush({ grant: GRANT });

    expect(result).toEqual(GRANT);
  });

  it('should POST a resource grant to a role', () => {
    const payload = {
      role_id: 1,
      resource_id: 2,
    };

    let result: ResourceRole | undefined;

    api.create(payload).subscribe((grant) => {
      result = grant;
    });

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({ grant: GRANT });

    expect(result).toEqual(GRANT);
  });

  it('should PATCH the deactivate endpoint', () => {
    api.deactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/deactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Grant deactivated (permission revoked)',
      grant: { ...GRANT, status: 'inactive' },
    });
  });

  it('should PATCH the reactivate endpoint', () => {
    api.reactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/reactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Grant reactivated',
      grant: GRANT,
    });
  });

  it('should use environment.apiUrl and the concesiones-rol endpoint', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(
      `${environment.apiUrl}/concesiones-rol`,
    );
    expect(request.request.method).toBe('GET');

    request.flush({ grants: [] });
  });
});
