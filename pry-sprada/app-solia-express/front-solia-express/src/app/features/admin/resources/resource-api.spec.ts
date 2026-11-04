
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { Resource } from '../../../core/models/resource.model';
import { ResourceApi } from './resource-api';

const BASE = `${environment.apiUrl}/recursos`;

const RESOURCE: Resource = {
  id: 1,
  method: 'GET',
  path: '/api/usuarios',
  description: 'Consultar usuarios',
  status: 'active',
};

describe('ResourceApi', () => {
  let api: ResourceApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(ResourceApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { resources } into Resource[]', () => {
    let result: Resource[] | undefined;

    api.list().subscribe((resources) => {
      result = resources;
    });

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('GET');

    request.flush({ resources: [RESOURCE] });

    expect(result).toEqual([RESOURCE]);
  });

  it('should unwrap { resource } when getting a resource', () => {
    let result: Resource | undefined;

    api.get(1).subscribe((resource) => {
      result = resource;
    });

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('GET');

    request.flush({ resource: RESOURCE });

    expect(result).toEqual(RESOURCE);
  });

  it('should POST a new resource', () => {
    const payload = {
      method: 'POST' as const,
      path: '/api/movements',
      description: 'Registrar movimientos',
      status: 'active' as const,
    };

    let result: Resource | undefined;

    api.create(payload).subscribe((resource) => {
      result = resource;
    });

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({ resource: RESOURCE });

    expect(result).toEqual(RESOURCE);
  });

  it('should PATCH a resource without changing its status', () => {
    const payload = {
      method: 'PATCH' as const,
      path: '/api/usuarios/:id',
      description: 'Actualizar usuario',
    };

    let result: Resource | undefined;

    api.update(1, payload).subscribe((resource) => {
      result = resource;
    });

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body).not.toHaveProperty('status');

    request.flush({ resource: RESOURCE });

    expect(result).toEqual(RESOURCE);
  });

  it('should PATCH the deactivate endpoint', () => {
    api.deactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/deactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({ message: 'Resource deactivated' });
  });

  it('should DELETE a resource', () => {
    api.remove(1).subscribe();

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('DELETE');

    request.flush({ message: 'Resource permanently deleted' });
  });

  it('should use environment.apiUrl and the recursos endpoint', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(`${environment.apiUrl}/recursos`);
    expect(request.request.method).toBe('GET');

    request.flush({ resources: [] });
  });
});
