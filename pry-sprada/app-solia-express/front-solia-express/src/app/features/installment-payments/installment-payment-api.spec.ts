import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../environments/environment';
import {
  InstallmentPayment,
  InstallmentPaymentPayload,
} from '../../core/models/installment-payment.model';
import { InstallmentPaymentApi } from './installment-payment-api';

const BASE = `${environment.apiUrl}/installment-payments`;

const PAYMENT: InstallmentPayment = {
  id: 1,
  installment_id: 10,
  payment_date: '2026-11-01',
  amount: 150000,
  reference: 'TRF-001',
  method: 'transfer',
  status: 'active',
};

describe('InstallmentPaymentApi', () => {
  let api: InstallmentPaymentApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(InstallmentPaymentApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { installment_payments } into InstallmentPayment[]', () => {
    let result: InstallmentPayment[] | undefined;

    api.list().subscribe((payments) => {
      result = payments;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('GET');

    request.flush({ installment_payments: [PAYMENT] });

    expect(result).toEqual([PAYMENT]);
  });

  it('should unwrap { installment_payment } when getting a payment by id', () => {
    let result: InstallmentPayment | undefined;

    api.get(1).subscribe((payment) => {
      result = payment;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('GET');

    request.flush({ installment_payment: PAYMENT });

    expect(result).toEqual(PAYMENT);
  });

  it('should create a payment with the supplied payload', () => {
    const payload: InstallmentPaymentPayload = {
      installment_id: 10,
      payment_date: '2026-11-01',
      amount: 150000,
      reference: 'TRF-001',
      method: 'transfer',
    };

    let result: InstallmentPayment | undefined;

    api.create(payload).subscribe((payment) => {
      result = payment;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      installment_payment: {
        id: 1,
        ...payload,
        status: 'active',
      },
    });

    expect(result?.installment_id).toBe(payload.installment_id);
    expect(result?.amount).toBe(payload.amount);
    expect(result?.method).toBe('transfer');
    expect(result?.status).toBe('active');
  });

  it('should update a payment using PATCH', () => {
    const payload = {
      amount: 175000,
      reference: 'TRF-002',
    };

    let result: InstallmentPayment | undefined;

    api.update(1, payload).subscribe((payment) => {
      result = payment;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush({
      installment_payment: {
        ...PAYMENT,
        ...payload,
      },
    });

    expect(result?.amount).toBe(175000);
    expect(result?.reference).toBe('TRF-002');
  });

  it('should deactivate a payment using PATCH', () => {
    api.deactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/deactivate`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Installment payment cancelled',
      installment_payment: {
        ...PAYMENT,
        status: 'cancelled',
      },
    });
  });

  it('should build its endpoint from environment.apiUrl', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(
      `${environment.apiUrl}/installment-payments`,
    );

    expect(request.request.method).toBe('GET');

    request.flush({ installment_payments: [] });
  });
});
