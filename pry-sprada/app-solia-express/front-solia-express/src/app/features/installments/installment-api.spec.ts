import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../environments/environment';
import {
  Installment,
  InstallmentPayload,
} from '../../core/models/installment.model';
import { InstallmentApi } from './installment-api';

const BASE = `${environment.apiUrl}/installments`;

const INSTALLMENT: Installment = {
  id: 1,
  credit_id: 100,
  number: 1,
  due_date: '2026-12-01',
  principal_amount: 350000,
  interest_amount: 15000,
  total_amount: 365000,
  paid_amount: 0,
  status: 'pending',
};

describe('InstallmentApi', () => {
  let api: InstallmentApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(InstallmentApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { installments } into Installment[]', () => {
    let result: Installment[] | undefined;

    api.list().subscribe((installments) => {
      result = installments;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('GET');

    request.flush({ installments: [INSTALLMENT] });

    expect(result).toEqual([INSTALLMENT]);
  });

  it('should unwrap { installment } when getting an installment by id', () => {
    let result: Installment | undefined;

    api.get(1).subscribe((installment) => {
      result = installment;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('GET');

    request.flush({ installment: INSTALLMENT });

    expect(result).toEqual(INSTALLMENT);
  });

  it('should create an installment with the supplied payload', () => {
    const payload: InstallmentPayload = {
      credit_id: 100,
      number: 1,
      due_date: '2026-12-01',
      principal_amount: 350000,
      interest_amount: 15000,
      total_amount: 365000,
    };

    let result: Installment | undefined;

    api.create(payload).subscribe((installment) => {
      result = installment;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      installment: {
        id: 1,
        ...payload,
        paid_amount: 0,
        status: 'pending',
      },
    });

    expect(result?.credit_id).toBe(payload.credit_id);
    expect(result?.total_amount).toBe(payload.total_amount);
    expect(result?.status).toBe('pending');
  });

  it('should update an installment using PATCH', () => {
    const payload = {
      due_date: '2027-01-01',
      principal_amount: 360000,
      interest_amount: 14000,
      total_amount: 374000,
    };

    let result: Installment | undefined;

    api.update(1, payload).subscribe((installment) => {
      result = installment;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body).not.toHaveProperty('status');

    request.flush({
      installment: {
        ...INSTALLMENT,
        ...payload,
      },
    });

    expect(result?.total_amount).toBe(374000);
    expect(result?.due_date).toBe('2027-01-01');
  });

  it('should cancel an installment using PATCH', () => {
    api.deactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/deactivate`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Installment cancelled',
      installment: {
        ...INSTALLMENT,
        status: 'cancelled',
      },
    });
  });

  it('should build its endpoint from environment.apiUrl', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(`${environment.apiUrl}/installments`);

    expect(request.request.method).toBe('GET');

    request.flush({ installments: [] });
  });
});
