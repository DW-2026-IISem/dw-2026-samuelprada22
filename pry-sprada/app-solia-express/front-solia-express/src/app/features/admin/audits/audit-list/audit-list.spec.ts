import '@angular/compiler';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { Audit } from '../../../../core/models/audit.model';
import { AuditList } from './audit-list';

const BASE = `${environment.apiUrl}/audits`;

const AUDITS: Audit[] = [
  {
    id: 1,
    actor_user_id: 3,
    action: 'CREATE',
    entity: 'CreditApplication',
    entity_id: 12,
    data: '{"message":"Credit application created"}',
    createdAt: '2026-11-02T18:30:00.000Z',
  },
  {
    id: 2,
    actor_user_id: 5,
    action: 'UPDATE',
    entity: 'Member',
    entity_id: 20,
    data: null,
    createdAt: '2026-11-03T10:15:00.000Z',
  },
];

describe('AuditList', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditList],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  async function createList() {
    const fixture = TestBed.createComponent(AuditList);
    fixture.detectChanges();
    await fixture.whenStable();

    return {
      fixture,
      list: fixture.componentInstance,
    };
  }

  function loadAudits() {
    http.expectOne(BASE).flush({ audits: AUDITS });
  }

  it('should load audit records from the API', async () => {
    const { list } = await createList();

    expect(list.loading()).toBe(true);

    loadAudits();

    expect(list.rows()).toEqual(AUDITS);
    expect(list.loading()).toBe(false);
    expect(list.error()).toBeNull();
  });

  it('should show an error when audit records cannot be loaded', async () => {
    const { fixture, list } = await createList();

    http.expectOne(BASE).flush(
      { message: 'Server error' },
      { status: 500, statusText: 'Server Error' },
    );

    fixture.detectChanges();

    expect(list.rows()).toEqual([]);
    expect(list.loading()).toBe(false);
    expect(list.error()).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain(
      'No se pudo cargar el historial de auditoría.',
    );
  });

  it('should filter records by ID, user, action and entity', async () => {
    const { list } = await createList();
    loadAudits();

    list.filter.set('CREATE');
    expect(list.visibleRows()).toEqual([AUDITS[0]]);

    list.filter.set('Member');
    expect(list.visibleRows()).toEqual([AUDITS[1]]);

    list.filter.set('5');
    expect(list.visibleRows()).toEqual([AUDITS[1]]);

    list.filter.set('12');
    expect(list.visibleRows()).toEqual([AUDITS[0]]);
  });

  it('should open the detail and load the complete audit record', async () => {
    const { list } = await createList();
    loadAudits();

    list.openDetail(AUDITS[0]);

    expect(list.detailVisible()).toBe(true);
    expect(list.detailLoading()).toBe(true);
    expect(list.selectedAudit()).toEqual(AUDITS[0]);

    const detail = {
      ...AUDITS[0],
      data: '{"message":"Complete audit detail"}',
    };

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('GET');
    request.flush({ audit: detail });

    expect(list.selectedAudit()).toEqual(detail);
    expect(list.detailLoading()).toBe(false);
    expect(list.detailError()).toBeNull();
  });

  it('should show an error when the audit detail cannot be loaded', async () => {
    const { list } = await createList();
    loadAudits();

    list.openDetail(AUDITS[0]);

    http.expectOne(`${BASE}/1`).flush(
      { message: 'Detail unavailable' },
      { status: 500, statusText: 'Server Error' },
    );

    expect(list.detailLoading()).toBe(false);
    expect(list.detailError()).toBeTruthy();
  });

  it('should format valid JSON data for display', async () => {
    const { list } = await createList();
    loadAudits();

    expect(list.formatData('{"action":"CREATE","id":12}')).toBe(
      JSON.stringify({ action: 'CREATE', id: 12 }, null, 2),
    );
  });

  it('should preserve plain text and handle null audit data', async () => {
    const { list } = await createList();
    loadAudits();

    expect(list.formatData('not-json')).toBe('not-json');
    expect(list.formatData(null)).toBe('Sin datos adicionales.');
    expect(list.formatData('')).toBe('Sin datos adicionales.');
  });
});
