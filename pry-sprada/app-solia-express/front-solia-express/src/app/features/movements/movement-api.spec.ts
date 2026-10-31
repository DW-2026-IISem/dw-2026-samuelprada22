import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Movement } from '../../core/models/movement.model';
import { MovementApi } from './movement-api';

const BASE = `${environment.apiUrl}/movements`;

const MOVEMENT: Movement = {
  id: 1,
  account_id: 10,
  reference_id: 25,
  type: 'deposit',
  date: '2026-10-30',
  amount: 150000,
  observations: 'Aporte de prueba',
  status: 'active',
};

describe('MovementApi', () => {
  let api: MovementApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(MovementApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { movements } into Movement[]', () => {
    let result: Movement[] | undefined;

    api.list().subscribe((movements) => {
      result = movements;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('GET');

    request.flush({ movements: [MOVEMENT] });

    expect(result).toEqual([MOVEMENT]);
  });

  it('should unwrap { movement } when getting a movement by id', () => {
    let result: Movement | undefined;

    api.get(1).subscribe((movement) => {
      result = movement;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('GET');

    request.flush({ movement: MOVEMENT });

    expect(result).toEqual(MOVEMENT);
  });

  it('should create a movement with the supplied payload', () => {
    const payload = {
      account_id: 10,
      reference_id: 25,
      type: 'deposit',
      date: '2026-10-30',
      amount: 150000,
      observations: 'Aporte de prueba',
    };

    let result: Movement | undefined;

    api.create(payload).subscribe((movement) => {
      result = movement;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({ movement: MOVEMENT });

    expect(result).toEqual(MOVEMENT);
  });

  it('should update a movement using PATCH', () => {
    const payload = {
      observations: 'Observación actualizada',
    };

    let result: Movement | undefined;

    api.update(1, payload).subscribe((movement) => {
      result = movement;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush({
      movement: {
        ...MOVEMENT,
        ...payload,
      },
    });

    expect(result?.observations).toBe(payload.observations);
  });

  it('should deactivate a movement using PATCH', () => {
    api.deactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/deactivate`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Movement deactivated',
      movement: { ...MOVEMENT, status: 'inactive' },
    });
  });

  it('should physically delete a movement using DELETE', () => {
    api.remove(1).subscribe();

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('DELETE');

    request.flush({
      message: 'Movement deleted',
      id: 1,
    });
  });

  it('should build its endpoint from environment.apiUrl', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(`${environment.apiUrl}/movements`);

    expect(request.request.method).toBe('GET');

    request.flush({ movements: [] });
  });
});
