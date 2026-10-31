import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Account } from '../../core/models/account.model';
import { AccountApi } from './account-api';

const BASE = `${environment.apiUrl}/accounts`;

const ACCOUNT: Account = {
  id: 1,
  member_id: 10,
  name: 'Ahorros',
  description: 'Cuenta de prueba',
  status: 'active',
};

describe('AccountApi', () => {
  let api: AccountApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(AccountApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { accounts } into Account[]', () => {
    let result: Account[] | undefined;

    api.list().subscribe((accounts) => {
      result = accounts;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('GET');

    request.flush({ accounts: [ACCOUNT] });

    expect(result).toEqual([ACCOUNT]);
  });

  it('should unwrap { account } when getting an account by id', () => {
    let result: Account | undefined;

    api.get(1).subscribe((account) => {
      result = account;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('GET');

    request.flush({ account: ACCOUNT });

    expect(result).toEqual(ACCOUNT);
  });

  it('should create an account with the supplied payload', () => {
    const payload = {
      member_id: 10,
      name: 'Ahorros',
      description: 'Cuenta de prueba',
    };

    let result: Account | undefined;

    api.create(payload).subscribe((account) => {
      result = account;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({ account: ACCOUNT });

    expect(result).toEqual(ACCOUNT);
  });

  it('should update an account using PATCH', () => {
    const payload = {
      name: 'Ahorros actualizada',
      description: 'Descripción actualizada',
    };

    let result: Account | undefined;

    api.update(1, payload).subscribe((account) => {
      result = account;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush({
      account: {
        ...ACCOUNT,
        ...payload,
      },
    });

    expect(result?.name).toBe(payload.name);
    expect(result?.description).toBe(payload.description);
  });

  it('should deactivate an account using PATCH', () => {
    api.deactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/deactivate`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Account deactivated',
      account: { ...ACCOUNT, status: 'inactive' },
    });
  });

  it('should physically delete an account using DELETE', () => {
    api.remove(1).subscribe();

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('DELETE');

    request.flush({
      message: 'Account deleted',
      id: 1,
    });
  });

  it('should build its endpoint from environment.apiUrl', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(`${environment.apiUrl}/accounts`);

    expect(request.request.method).toBe('GET');

    request.flush({ accounts: [] });
  });
});
