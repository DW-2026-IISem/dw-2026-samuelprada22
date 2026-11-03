import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CommitteeDecision } from '../../core/models/committee-decision.model';
import { CommitteeDecisionApi } from './committee-decision-api';

const BASE = `${environment.apiUrl}/committee-decisions`;

const COMMITTEE_DECISION: CommitteeDecision = {
  id: 1,
  credit_application_id: 10,
  decision: 'approved',
  decision_date: '2026-11-02T10:00:00.000Z',
  comments: 'Solicitud aprobada por el comité',
  decided_by: 2,
  status: 'active',
};

describe('CommitteeDecisionApi', () => {
  let api: CommitteeDecisionApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(CommitteeDecisionApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { committee_decisions } into CommitteeDecision[]', () => {
    let result: CommitteeDecision[] | undefined;

    api.list().subscribe((decisions) => {
      result = decisions;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('GET');

    request.flush({
      committee_decisions: [COMMITTEE_DECISION],
    });

    expect(result).toEqual([COMMITTEE_DECISION]);
  });

  it('should unwrap { committee_decision } when getting a decision by id', () => {
    let result: CommitteeDecision | undefined;

    api.get(1).subscribe((decision) => {
      result = decision;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('GET');

    request.flush({
      committee_decision: COMMITTEE_DECISION,
    });

    expect(result).toEqual(COMMITTEE_DECISION);
  });

  it('should create a committee decision with the supplied payload', () => {
    const payload = {
      credit_application_id: 10,
      decision: 'approved' as const,
      decision_date: '2026-11-02T10:00:00.000Z',
      comments: 'Solicitud aprobada por el comité',
      decided_by: 2,
    };

    let result: CommitteeDecision | undefined;

    api.create(payload).subscribe((decision) => {
      result = decision;
    });

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      committee_decision: COMMITTEE_DECISION,
    });

    expect(result).toEqual(COMMITTEE_DECISION);
  });

  it('should update a committee decision using PATCH', () => {
    const payload = {
      decision: 'observed' as const,
      comments: 'Se requiere documentación adicional',
    };

    let result: CommitteeDecision | undefined;

    api.update(1, payload).subscribe((decision) => {
      result = decision;
    });

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);

    request.flush({
      committee_decision: {
        ...COMMITTEE_DECISION,
        ...payload,
        decision: 'observed',
      },
    });

    expect(result?.decision).toBe('observed');
    expect(result?.comments).toBe(payload.comments);
  });

  it('should cancel a committee decision using PATCH', () => {
    api.deactivate(1).subscribe();

    const request = http.expectOne(`${BASE}/1/deactivate`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Committee decision cancelled',
      committee_decision: {
        ...COMMITTEE_DECISION,
        status: 'cancelled',
      },
    });
  });

  it('should build its endpoint from environment.apiUrl', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(
      `${environment.apiUrl}/committee-decisions`,
    );

    expect(request.request.method).toBe('GET');

    request.flush({
      committee_decisions: [],
    });
  });
});
