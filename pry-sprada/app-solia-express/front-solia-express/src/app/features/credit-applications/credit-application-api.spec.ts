import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CreditApplication } from '../../core/models/credit-application.model';
import { CreditApplicationApi } from './credit-application-api';

const BASE = `${environment.apiUrl}/credit-applications`;

const CREDIT_APPLICATION: CreditApplication = {
  id: 1,
  member_id: 10,
  reference_id: null,
  date: '2026-11-01T10:00:00.000Z',
  amount: 5000000,
  status: 'pending',
  observations: 'Solicitud de crédito personal',
};

describe('CreditApplicationApi', () => {
  let api: CreditApplicationApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(CreditApplicationApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { credit_applications } into CreditApplication[]', () => {
    let result: CreditApplication[] | undefined;

    api.list().subscribe((applications) => {
      result = applications;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('GET');

    request.flush({
      credit_applications: [CREDIT_APPLICATION],
    });

    expect(result).toEqual([CREDIT_APPLICATION]);
  });

  it('should unwrap { credit_application } when getting an application by id', () => {
    let result: CreditApplication | undefined;

    api.get(1).subscribe((application) => {
      result = application;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('GET');

    request.flush({
      credit_application: CREDIT_APPLICATION,
    });

    expect(result).toEqual(CREDIT_APPLICATION);
  });

  it('should create a credit application with the supplied payload', () => {
    const payload = {
      member_id: 10,
      reference_id: null,
      date: '2026-11-01T10:00:00.000Z',
      amount: 5000000,
      observations: 'Solicitud de crédito personal',
    };

    let result: CreditApplication | undefined;

    api.create(payload).subscribe((application) => {
      result = application;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      credit_application: CREDIT_APPLICATION,
    });

    expect(result).toEqual(CREDIT_APPLICATION);
  });

  it('should update a credit application using PATCH', () => {
    const payload = {
      amount: 6000000,
      observations: 'Monto actualizado',
    };

    let result: CreditApplication | undefined;

    api.update(1, payload).subscribe((application) => {
      result = application;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush({
      credit_application: {
        ...CREDIT_APPLICATION,
        ...payload,
      },
    });

    expect(result?.amount).toBe(payload.amount);
    expect(result?.observations).toBe(payload.observations);
  });

  it('should cancel a credit application using PATCH', () => {
    api.deactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/deactivate`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Solicitud de crédito cancelada correctamente',
      credit_application: {
        ...CREDIT_APPLICATION,
        status: 'cancelled',
      },
    });
  });

  it('should build its endpoint from environment.apiUrl', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(
      `${environment.apiUrl}/credit-applications`,
    );

    expect(request.request.method).toBe('GET');

    request.flush({
      credit_applications: [],
    });
  });
});
