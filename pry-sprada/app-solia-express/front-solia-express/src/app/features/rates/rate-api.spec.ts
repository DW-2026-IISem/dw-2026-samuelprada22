import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Rate } from '../../core/models/rate.model';
import { RateApi } from './rate-api';

const BASE = `${environment.apiUrl}/rates`;

const RATE: Rate = {
  id: 1,
  name: 'Tasa mensual ordinaria',
  percentage: 2.5,
  type: 'monthly',
  description: 'Tasa de prueba',
  status: 'active',
};

describe('RateApi', () => {
  let api: RateApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(RateApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { rates } into Rate[]', () => {
    let result: Rate[] | undefined;

    api.list().subscribe((rates) => {
      result = rates;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('GET');

    request.flush({ rates: [RATE] });

    expect(result).toEqual([RATE]);
  });

  it('should unwrap { rate } when getting a rate by id', () => {
    let result: Rate | undefined;

    api.get(1).subscribe((rate) => {
      result = rate;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('GET');

    request.flush({ rate: RATE });

    expect(result).toEqual(RATE);
  });

  it('should create a rate with the supplied payload', () => {
    const payload = {
      name: 'Tasa mensual ordinaria',
      percentage: 2.5,
      type: 'monthly' as const,
      description: 'Tasa de prueba',
    };

    let result: Rate | undefined;

    api.create(payload).subscribe((rate) => {
      result = rate;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({ rate: RATE });

    expect(result).toEqual(RATE);
  });

  it('should update a rate using PATCH', () => {
    const payload = {
      name: 'Tasa mensual actualizada',
      percentage: 3,
    };

    let result: Rate | undefined;

    api.update(1, payload).subscribe((rate) => {
      result = rate;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush({
      rate: {
        ...RATE,
        ...payload,
      },
    });

    expect(result?.name).toBe(payload.name);
    expect(result?.percentage).toBe(payload.percentage);
  });

  it('should deactivate a rate using PATCH', () => {
    api.deactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/deactivate`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Rate deactivated',
      rate: {
        ...RATE,
        status: 'inactive',
      },
    });
  });

  it('should build its endpoint from environment.apiUrl', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(`${environment.apiUrl}/rates`);

    expect(request.request.method).toBe('GET');

    request.flush({ rates: [] });
  });
});
