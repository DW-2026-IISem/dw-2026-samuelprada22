import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../../environments/environment';
import { Credit, CreditPayload } from '../../../core/models/credit.model';
import { CreditApplication } from '../../../core/models/credit-application.model';
import { Rate } from '../../../core/models/rate.model';
import { Member } from '../../../core/models/member.model';
import { NotificationService } from '../../../core/services/notification';
import { MemberApi } from '../../members/member-api';
import { CreditList } from './credit-list';

const CREDIT_BASE = `${environment.apiUrl}/credits`;
const APPLICATION_BASE = `${environment.apiUrl}/credit-applications`;
const RATE_BASE = `${environment.apiUrl}/rates`;

const MEMBERS: Member[] = [
  {
    id: 10,
    name: 'Ana',
    description: 'Socio principal',
    isActive: true,
  },
  {
    id: 20,
    name: 'Samuel',
    description: null,
    isActive: true,
  },
];

const APPLICATIONS: CreditApplication[] = [
  {
    id: 1,
    member_id: 10,
    reference_id: 100,
    date: '2026-10-20T00:00:00.000Z',
    amount: 500000,
    status: 'approved',
    observations: null,
  },
  {
    id: 2,
    member_id: 20,
    reference_id: null,
    date: '2026-10-21T00:00:00.000Z',
    amount: '750000.00',
    status: 'approved',
    observations: null,
  },
];

const RATES: Rate[] = [
  {
    id: 5,
    name: 'Tasa ordinaria',
    percentage: '2.50',
    type: 'monthly',
    description: null,
    status: 'active',
  },
  {
    id: 6,
    name: 'Tasa anual',
    percentage: 12,
    type: 'annual',
    description: 'Tasa anual',
    status: 'active',
  },
];

const CREDITS: Credit[] = [
  {
    id: 100,
    credit_application_id: 1,
    rate_id: 5,
    date: '2026-10-25T00:00:00.000Z',
    approved_amount: '450000.00',
    term: 12,
    interest_rate: '2.50',
    status: 'active',
    observations: 'Crédito inicial',
  },
  {
    id: 101,
    credit_application_id: 2,
    rate_id: 6,
    date: '2026-10-26T00:00:00.000Z',
    approved_amount: 700000,
    term: 24,
    interest_rate: 12,
    status: 'paid',
    observations: null,
  },
  {
    id: 102,
    credit_application_id: 1,
    rate_id: 5,
    date: '2026-10-27T00:00:00.000Z',
    approved_amount: 300000,
    term: 6,
    interest_rate: 2.5,
    status: 'cancelled',
    observations: null,
  },
];

describe('CreditList', () => {
  let http: HttpTestingController;

  let notifications: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
  };

  let confirmationService: ConfirmationService;
  let pendingConfirmation: any;
  let memberApi: { list: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    notifications = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    };

    confirmationService = new ConfirmationService();
    pendingConfirmation = undefined;

    vi.spyOn(confirmationService, 'confirm').mockImplementation((options) => {
      pendingConfirmation = options;
      return confirmationService;
    });

    memberApi = {
      list: vi.fn(() => of(MEMBERS)),
    };

    await TestBed.configureTestingModule({
      imports: [CreditList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: NotificationService,
          useValue: notifications,
        },
        {
          provide: ConfirmationService,
          useValue: confirmationService,
        },
        {
          provide: MemberApi,
          useValue: memberApi,
        },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    try {
      http.verify({ ignoreCancelled: true });
    } finally {
      TestBed.resetTestingModule();
    }
  });

  async function createList() {
    const fixture = TestBed.createComponent(CreditList);
    fixture.detectChanges();
    await fixture.whenStable();

    return {
      fixture,
      list: fixture.componentInstance,
    };
  }

  function loadData(
    credits: Credit[] = CREDITS,
    applications: CreditApplication[] = APPLICATIONS,
    rates: Rate[] = RATES,
  ) {
    http.expectOne(CREDIT_BASE).flush({ credits });
    http.expectOne(APPLICATION_BASE).flush({
      credit_applications: applications,
    });
    http.expectOne(RATE_BASE).flush({ rates });
  }

  function reloadData() {
    loadData();
  }

  it('should load credits and their related resources', async () => {
    const { list } = await createList();

    expect(list.loading()).toBe(true);

    loadData();

    expect(list.rows()).toEqual(CREDITS);
    expect(list.applications()).toEqual(APPLICATIONS);
    expect(list.rates()).toEqual(RATES);
    expect(list.members()).toEqual(MEMBERS);
    expect(list.loading()).toBe(false);
    expect(list.error()).toBeNull();

    expect(list.applicationFor()(1)).toEqual(APPLICATIONS[0]);
    expect(list.rateFor()(5)).toEqual(RATES[0]);
    expect(list.memberName()(10)).toBe('Ana');
  });

  it('should show an error when credits cannot be loaded', async () => {
    const { fixture, list } = await createList();

    http.expectOne(CREDIT_BASE).flush(
      { message: 'Server error' },
      { status: 500, statusText: 'Server Error' },
    );

    fixture.detectChanges();

    expect(list.rows()).toEqual([]);
    expect(list.loading()).toBe(false);
    expect(list.error()).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain(
      'No se pudo cargar el listado de créditos.',
    );
  });

  it('should show a warning when applications cannot be loaded', async () => {
    const { list } = await createList();

    http.expectOne(CREDIT_BASE).flush({ credits: CREDITS });
    http.expectOne(APPLICATION_BASE).flush(
      { message: 'Applications unavailable' },
      { status: 500, statusText: 'Server Error' },
    );
    http.expectOne(RATE_BASE).flush({ rates: RATES });

    expect(list.applications()).toEqual([]);
    expect(list.applicationsError()).toBe(true);
    expect(list.loading()).toBe(false);
  });

  it('should show a warning when rates cannot be loaded', async () => {
    const { list } = await createList();

    http.expectOne(CREDIT_BASE).flush({ credits: CREDITS });
    http.expectOne(APPLICATION_BASE).flush({
      credit_applications: APPLICATIONS,
    });
    http.expectOne(RATE_BASE).flush(
      { message: 'Rates unavailable' },
      { status: 500, statusText: 'Server Error' },
    );

    expect(list.rates()).toEqual([]);
    expect(list.ratesError()).toBe(true);
    expect(list.loading()).toBe(false);
  });

  it('should use identifiers when related records are unavailable', async () => {
    memberApi.list.mockReturnValue(of([]));

    const { list } = await createList();

    http.expectOne(CREDIT_BASE).flush({ credits: CREDITS });
    http.expectOne(APPLICATION_BASE).flush({
      credit_applications: [],
    });
    http.expectOne(RATE_BASE).flush({ rates: [] });

    expect(list.memberName()(10)).toBe('Socio #10');
    expect(list.applicationFor()(1)).toBeUndefined();
    expect(list.rateFor()(5)).toBeUndefined();
  });

  it('should show a warning when members cannot be loaded', async () => {
    memberApi.list.mockReturnValue(
      throwError(() => new Error('Members unavailable')),
    );

    const { list } = await createList();
    loadData();

    expect(list.members()).toEqual([]);
    expect(list.membersError()).toBe(true);
    expect(list.memberName()(10)).toBe('Socio #10');
  });

  it('should filter credits locally by member, rate, status and identifier', async () => {
    const { list } = await createList();
    loadData();

    list.filter.set('ANA');

    expect(list.visibleRows()).toEqual([
      CREDITS[0],
      CREDITS[2],
    ]);

    list.filter.set('tasa anual');

    expect(list.visibleRows()).toEqual([CREDITS[1]]);

    list.filter.set('pagado');

    expect(list.visibleRows()).toEqual([CREDITS[1]]);

    list.filter.set('100');

    expect(list.visibleRows()).toEqual([
      CREDITS[0],
      CREDITS[2],
    ]);

    http.expectNone(CREDIT_BASE);
  });

  it('should translate credit statuses and return their severities', async () => {
    const { list } = await createList();

    expect(list.statusLabel('active')).toBe('Activo');
    expect(list.statusLabel('paid')).toBe('Pagado');
    expect(list.statusLabel('cancelled')).toBe('Cancelado');

    expect(list.statusSeverity('active')).toBe('success');
    expect(list.statusSeverity('paid')).toBe('info');
    expect(list.statusSeverity('cancelled')).toBe('secondary');

    loadData([]);
  });

  it('should format amounts and percentages', async () => {
    const { list } = await createList();

    expect(list.formatAmount(450000)).toContain('450.000');
    expect(list.formatPercentage('2.50')).toContain('2,5');

    loadData([]);
  });

  it('should open the create dialog and POST a new credit', async () => {
    const { list } = await createList();
    loadData();

    const payload: CreditPayload = {
      credit_application_id: 1,
      rate_id: 5,
      date: '2026-11-01T00:00:00.000Z',
      approved_amount: 400000,
      term: 12,
      interest_rate: 2.5,
      observations: 'Nuevo crédito',
    };

    list.openCreate();

    expect(list.title()).toBe('Nuevo crédito');
    expect(list.editing()).toBeNull();
    expect(list.dialogVisible()).toBe(true);

    list.save(payload);

    const request = http.expectOne(CREDIT_BASE);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      credit: {
        id: 103,
        ...payload,
        status: 'active',
      },
    });

    expect(list.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith('Crédito creado');

    reloadData();
  });

  it('should PATCH an edited credit without sending its status', async () => {
    const { list } = await createList();
    loadData();

    const payload: CreditPayload = {
      credit_application_id: 1,
      rate_id: 5,
      date: '2026-11-01T00:00:00.000Z',
      approved_amount: 500000,
      term: 18,
      interest_rate: 2.5,
      observations: 'Crédito actualizado',
    };

    list.openEdit(CREDITS[0]);

    expect(list.title()).toBe('Editar crédito');
    expect(list.editing()).toEqual(CREDITS[0]);

    list.save(payload);

    const request = http.expectOne(`${CREDIT_BASE}/100`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body).not.toHaveProperty('status');

    request.flush({
      credit: {
        ...CREDITS[0],
        ...payload,
      },
    });

    expect(list.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith(
      'Crédito actualizado',
    );

    reloadData();
  });

  it('should show an error when creating a credit fails', async () => {
    const { list } = await createList();
    loadData();

    list.openCreate();

    list.save({
      credit_application_id: 1,
      rate_id: 5,
      date: '2026-11-01T00:00:00.000Z',
      approved_amount: 400000,
      term: 12,
      interest_rate: 2.5,
      observations: null,
    });

    http.expectOne(CREDIT_BASE).flush(
      { message: 'Creation failed' },
      { status: 500, statusText: 'Server Error' },
    );

    expect(list.saving()).toBe(false);
    expect(notifications.error).toHaveBeenCalled();
  });

  it('should PATCH deactivate after confirmation is accepted', async () => {
    const { list } = await createList();
    loadData();

    list.cancelCredit(CREDITS[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(pendingConfirmation).toBeTruthy();

    pendingConfirmation.accept();

    const request = http.expectOne(`${CREDIT_BASE}/100/deactivate`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Credit cancelled',
      credit: {
        ...CREDITS[0],
        status: 'cancelled',
      },
    });

    expect(notifications.success).toHaveBeenCalledWith(
      'Crédito cancelado',
    );

    reloadData();
  });

  it('should not request cancellation for an already cancelled credit', async () => {
    const { list } = await createList();
    loadData();

    list.cancelCredit(CREDITS[2]);

    expect(confirmationService.confirm).not.toHaveBeenCalled();
    http.expectNone(`${CREDIT_BASE}/102/deactivate`);
  });

  it('should not cancel a credit when confirmation is rejected', async () => {
    const { list } = await createList();
    loadData();

    list.cancelCredit(CREDITS[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${CREDIT_BASE}/100/deactivate`);
  });
});
