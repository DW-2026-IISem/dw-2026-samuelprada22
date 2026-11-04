import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { EffectivePermission } from '../../../core/models/auth.model';
import { User } from '../../../core/models/user.model';
import { UserApi } from './user-api';

const BASE = `${environment.apiUrl}/usuarios`;

const USER: User = {
  id: 1,
  username: 'admin',
  email: 'admin@solia.test',
  avatar: null,
  status: 'active',
};

describe('UserApi', () => {
  let api: UserApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(UserApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { users } into User[]', () => {
    let result: User[] | undefined;

    api.list().subscribe((users) => {
      result = users;
    });

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('GET');

    request.flush({ users: [USER] });

    expect(result).toEqual([USER]);
  });

  it('should unwrap { user } when getting a user', () => {
    let result: User | undefined;

    api.get(1).subscribe((user) => {
      result = user;
    });

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('GET');

    request.flush({ user: USER });

    expect(result).toEqual(USER);
  });

  it('should POST a new user', () => {
    const payload = {
      username: 'nuevo',
      email: 'nuevo@solia.test',
      password: 'Password123!',
    };

    let result: User | undefined;

    api.create(payload).subscribe((user) => {
      result = user;
    });

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({ user: USER });

    expect(result).toEqual(USER);
  });

  it('should PATCH a user profile', () => {
    const payload = {
      username: 'admin_actualizado',
      email: 'actualizado@solia.test',
    };

    let result: User | undefined;

    api.update(1, payload).subscribe((user) => {
      result = user;
    });

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush({ user: USER });

    expect(result).toEqual(USER);
  });

  it('should PATCH the deactivate endpoint', () => {
    api.deactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/deactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({ message: 'User deactivated' });
  });

  it('should DELETE a user', () => {
    api.remove(1).subscribe();

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('DELETE');

    request.flush({ message: 'User permanently deleted' });
  });

  it('should unwrap effective permissions', () => {
    const permissions: EffectivePermission[] = [
      {
        resource_id: 1,
        method: 'GET',
        path: '/api/usuarios',
        description: 'Consultar usuarios',
        role_id: 1,
        role_name: 'ADMIN',
      },
    ];

    let result: EffectivePermission[] | undefined;

    api.effectivePermissions(1).subscribe((value) => {
      result = value;
    });

    const request = http.expectOne(`${BASE}/1/permisos`);
    expect(request.request.method).toBe('GET');

    request.flush({ permissions });

    expect(result).toEqual(permissions);
  });

  it('should use environment.apiUrl and the usuarios endpoint', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(`${environment.apiUrl}/usuarios`);
    expect(request.request.method).toBe('GET');

    request.flush({ users: [] });
  });
});
