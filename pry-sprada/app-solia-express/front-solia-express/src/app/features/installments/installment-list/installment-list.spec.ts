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
import { Credit } from '../../../core/models/credit.model';
import {
  Installment,
  InstallmentPayload,
} from '../../../core/models/installment.model';
import { NotificationService } from '../../../core/services/notification';
import { CreditApi } from '../../credits/credit-api';
import { InstallmentList } from './installment-list';

const BASE = `${environment.apiUrl}/installments`;

const CREDITS: Credit[] = [
  {
    id: 100,
    credit_application_id: 1,
    rate_id: 5,
    date: '2026-10-25',
    approved_amount: '450000.00',
    term: 12,
    interest_rate: '2.50',
    status: 'active',
    observations: null,
  },
  {
    id: 101,
    credit_application_id: 2,
    rate_id: 6,
    date: '2026-10-26',
    approved_amount: 700000,
    term: 24,
    interest_rate: 12,
    status: 'paid',
    observations: null,
  },
];

const INSTALLMENTS: Installment[] = [
  {
    id: 1,
    credit_id: 100,
    number: 1,
    due_date: '2026-12-01',
    principal_amount: 350000,
    interest_amount: 15000,
    total_amount: 365000,
    paid_amount: 0,
    status: 'pending',
  },
  {
    id: 2,
    credit_id: 101,
    number: 2,
    due_date: '2027-01-01',
    principal_amount: '200000.00',
    interest_amount: '12000.00',
    total_amount: '212000.00',
    paid_amount: 0,
    status: 'pending',
  },
];

describe('InstallmentList', () => {
  let http: HttpTestingController;

  let notifications: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
  };

  let confirmationService: ConfirmationService;
  let pendingConfirmation: any;

  let creditApi: {
    list: ReturnType<typeof vi.fn>;
  };

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

    creditApi = {
      list: vi.fn(() => of(CREDITS)),
    };

    await TestBed.configureTestingModule({
      imports: [InstallmentList],
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
          provide: CreditApi,
          useValue: creditApi,
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
    const fixture = TestBed.createComponent(InstallmentList);
    fixture.detectChanges();
    await fixture.whenStable();

    return {
      fixture,
      list: fixture.componentInstance,
    };
  }

  function loadData(installments: Installment[] = INSTALLMENTS) {
    http.expectOne(BASE).flush({ installments });
  }

  function reloadData(installments: Installment[] = INSTALLMENTS) {
    loadData(installments);
  }

  it('should load pending installments and their related credits', async () => {
    const { list } = await createList();

    expect(list.loading()).toBe(true);

    loadData();

    expect(list.rows()).toEqual(INSTALLMENTS);
    expect(list.credits()).toEqual(CREDITS);
    expect(list.loading()).toBe(false);
    expect(list.error()).toBeNull();

    expect(list.creditFor()(100)).toEqual(CREDITS[0]);
    expect(list.creditFor()(101)).toEqual(CREDITS[1]);
  });

  it('should show an error when installments cannot be loaded', async () => {
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
      'No se pudieron cargar las cuotas',
    );
  });

  it('should show a warning when credits cannot be loaded', async () => {
    creditApi.list.mockReturnValue(
      throwError(() => new Error('Credits unavailable')),
    );

    const { list } = await createList();
    loadData();

    expect(list.credits()).toEqual([]);
    expect(list.creditsError()).toBe(true);
  });

  it('should filter installments by identifiers, credit, date and amounts', async () => {
    const { list } = await createList();
    loadData();

    list.filter.set('100');

    expect(list.visibleRows()).toEqual([INSTALLMENTS[0]]);

    list.filter.set('2027-01-01');

    expect(list.visibleRows()).toEqual([INSTALLMENTS[1]]);

    list.filter.set('365000');

    expect(list.visibleRows()).toEqual([INSTALLMENTS[0]]);

    list.filter.set('212000');

    expect(list.visibleRows()).toEqual([INSTALLMENTS[1]]);
  });

  it('should translate installment statuses and return their severities', async () => {
    const { list } = await createList();

    expect(list.statusLabel('pending')).toBe('Pendiente');
    expect(list.statusLabel('paid')).toBe('Pagada');
    expect(list.statusLabel('overdue')).toBe('Vencida');
    expect(list.statusLabel('cancelled')).toBe('Cancelada');

    expect(list.statusSeverity('pending')).toBe('warn');
    expect(list.statusSeverity('paid')).toBe('success');
    expect(list.statusSeverity('overdue')).toBe('danger');
    expect(list.statusSeverity('cancelled')).toBe('secondary');

    loadData([]);
  });

  it('should format monetary amounts in Colombian pesos', async () => {
    const { list } = await createList();

    expect(list.formatAmount(365000)).toContain('365.000');
    expect(list.formatAmount('212000.00')).toContain('212.000');

    loadData([]);
  });

  it('should open the create dialog and POST a new installment', async () => {
    const { list } = await createList();
    loadData();

    const payload: InstallmentPayload = {
      credit_id: 100,
      number: 3,
      due_date: '2027-02-01',
      principal_amount: 300000,
      interest_amount: 12000,
      total_amount: 312000,
    };

    list.openCreate();

    expect(list.title()).toBe('Nueva cuota');
    expect(list.editing()).toBeNull();
    expect(list.dialogVisible()).toBe(true);

    list.save(payload);

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      installment: {
        id: 3,
        ...payload,
        paid_amount: 0,
        status: 'pending',
      },
    });

    expect(list.saving()).toBe(false);
    expect(list.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith(
      'Cuota registrada',
    );

    reloadData();
  });

  it('should PATCH an edited installment without changing its status or paid amount', async () => {
    const { list } = await createList();
    loadData();

    const payload: InstallmentPayload = {
      credit_id: 100,
      number: 1,
      due_date: '2027-01-15',
      principal_amount: 360000,
      interest_amount: 14000,
      total_amount: 374000,
    };

    list.openEdit(INSTALLMENTS[0]);
    expect(list.title()).toBe('Editar cuota');

    list.save(payload);

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      credit_id: payload.credit_id,
      number: payload.number,
      due_date: payload.due_date,
      principal_amount: payload.principal_amount,
      interest_amount: payload.interest_amount,
      total_amount: payload.total_amount,
    });

    expect(request.request.body).not.toHaveProperty('status');
    expect(request.request.body).not.toHaveProperty('paid_amount');

    request.flush({
      installment: {
        ...INSTALLMENTS[0],
        ...payload,
      },
    });

    expect(list.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith(
      'Cuota actualizada',
    );

    reloadData();
  });

  it('should show an error when saving an installment fails', async () => {
    const { list } = await createList();
    loadData();

    list.openCreate();

    list.save({
      credit_id: 100,
      number: 3,
      due_date: '2027-02-01',
      principal_amount: 300000,
      interest_amount: 12000,
      total_amount: 312000,
    });

    http.expectOne(BASE).flush(
      { message: 'Creation failed' },
      { status: 500, statusText: 'Server Error' },
    );

    expect(list.saving()).toBe(false);
    expect(notifications.error).toHaveBeenCalled();
  });

  it('should PATCH deactivate after confirmation is accepted', async () => {
    const { list } = await createList();
    loadData();

    list.cancelInstallment(INSTALLMENTS[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(pendingConfirmation).toBeTruthy();

    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1/deactivate`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Installment cancelled',
      installment: {
        ...INSTALLMENTS[0],
        status: 'cancelled',
      },
    });

    expect(notifications.success).toHaveBeenCalledWith(
      'Cuota cancelada',
    );

    reloadData();
  });

  it('should not request cancellation when an installment has payments', async () => {
    const { list } = await createList();
    loadData();

    const partiallyPaid: Installment = {
      ...INSTALLMENTS[0],
      paid_amount: 50000,
    };

    list.cancelInstallment(partiallyPaid);

    expect(confirmationService.confirm).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith(
      'No se puede cancelar la cuota',
      'La cuota tiene abonos registrados.',
    );

    http.expectNone(`${BASE}/1/deactivate`);
  });

  it('should not cancel an installment when confirmation is rejected', async () => {
    const { list } = await createList();
    loadData();

    list.cancelInstallment(INSTALLMENTS[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${BASE}/1/deactivate`);
  });
});
