import '@angular/compiler';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { Audit } from '../../../core/models/audit.model';
import { AuditApi } from './audit-api';

const BASE = `${environment.apiUrl}/audits`;

const AUDIT: Audit = {
  id: 1,
  actor_user_id: 3,
  action: 'CREATE',
  entity: 'CreditApplication',
  entity_id: 12,
  data: '{"message":"Credit application created"}',
  createdAt: '2026-11-02T18:30:00.000Z',
};

describe('AuditApi', () => {
  let api: AuditApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(AuditApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should unwrap { audits } into Audit[]', () => {
    let result: Audit[] | undefined;

    api.list().subscribe((audits) => {
      result = audits;
    });

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('GET');
    request.flush({ audits: [AUDIT] });

    expect(result).toEqual([AUDIT]);
  });

  it('should unwrap { audit } when getting an audit by id', () => {
    let result: Audit | undefined;

    api.get(1).subscribe((audit) => {
      result = audit;
    });

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('GET');
    request.flush({ audit: AUDIT });

    expect(result).toEqual(AUDIT);
  });

  it('should build its endpoint from environment.apiUrl', () => {
    expect(environment.apiUrl.endsWith('/api')).toBe(true);

    api.list().subscribe();

    const request = http.expectOne(`${environment.apiUrl}/audits`);
    expect(request.request.method).toBe('GET');
    request.flush({ audits: [] });
  });

  it('should support audit records with null data', () => {
    const audit: Audit = { ...AUDIT, data: null };
    let result: Audit | undefined;

    api.get(audit.id).subscribe((value) => {
      result = value;
    });

    const request = http.expectOne(`${BASE}/${audit.id}`);
    request.flush({ audit });

    expect(result?.data).toBeNull();
  });
});
