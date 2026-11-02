import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Credit } from '../../core/models/credit.model';
import { CreditApi } from './credit-api';

const BASE = `${environment.apiUrl}/credits`;

const CREDIT: Credit = {
  id: 1,
  credit_application_id: 10,
  rate_id: 2,
  date: '2026-11-01T10:00:00.000Z',
  approved_amount: 5000000,
  term: 12,
  interest_rate: 2.5,
  status: 'active',
  observations: 'Crédito de prueba',
};

describe('CreditApi', () => {
  let api: CreditApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(CreditApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { credits } into Credit[]', () => {
    let result: Credit[] | undefined;

    api.list().subscribe((credits) => {
      result = credits;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('GET');

    request.flush({ credits: [CREDIT] });

    expect(result).toEqual([CREDIT]);
  });

  it('should unwrap { credit } when getting a credit by id', () => {
    let result: Credit | undefined;

    api.get(1).subscribe((credit) => {
      result = credit;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('GET');

    request.flush({ credit: CREDIT });

    expect(result).toEqual(CREDIT);
  });

  it('should create a credit with the supplied payload', () => {
    const payload = {
      credit_application_id: 10,
      rate_id: 2,
      date: '2026-11-01T10:00:00.000Z',
      approved_amount: 5000000,
      term: 12,
      interest_rate: 2.5,
      observations: 'Crédito de prueba',
    };

    let result: Credit | undefined;

    api.create(payload).subscribe((credit) => {
      result = credit;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({ credit: CREDIT });

    expect(result).toEqual(CREDIT);
  });

  it('should update a credit using PATCH', () => {
    const payload = {
      approved_amount: 6000000,
      term: 18,
      observations: 'Monto actualizado',
    };

    let result: Credit | undefined;

    api.update(1, payload).subscribe((credit) => {
      result = credit;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush({
      credit: {
        ...CREDIT,
        ...payload,
      },
    });

    expect(result?.approved_amount).toBe(payload.approved_amount);
    expect(result?.term).toBe(payload.term);
    expect(result?.observations).toBe(payload.observations);
  });

  it('should cancel a credit using PATCH', () => {
    api.deactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/deactivate`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Credit cancelled',
      credit: {
        ...CREDIT,
        status: 'cancelled',
      },
    });
  });

  it('should build its endpoint from environment.apiUrl', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(`${environment.apiUrl}/credits`);

    expect(request.request.method).toBe('GET');

    request.flush({ credits: [] });
  });
});
