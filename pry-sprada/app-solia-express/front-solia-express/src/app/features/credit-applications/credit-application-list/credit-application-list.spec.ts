import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../../environments/environment';
import {
  CreditApplication,
  CreditApplicationPayload,
} from '../../../core/models/credit-application.model';
import { NotificationService } from '../../../core/services/notification';
import { MemberApi } from '../../members/member-api';
import { CreditApplicationList } from './credit-application-list';

const BASE = `${environment.apiUrl}/credit-applications`;

const APPLICATIONS: CreditApplication[] = [
  {
    id: 1,
    member_id: 10,
    member: { id: 10, name: 'Ana' },
    reference_id: 100,
    date: '2026-10-20T00:00:00.000Z',
    amount: 500000,
    status: 'pending',
    observations: 'Solicitud inicial',
  },
  {
    id: 2,
    member_id: 20,
    member: { id: 20, name: 'Samuel' },
    reference_id: null,
    date: '2026-10-21T00:00:00.000Z',
    amount: '750000.00',
    status: 'approved',
    observations: null,
  },
  {
    id: 3,
    member_id: 10,
    member: { id: 10, name: 'Ana' },
    reference_id: null,
    date: '2026-10-22T00:00:00.000Z',
    amount: 300000,
    status: 'cancelled',
    observations: 'Solicitud cancelada',
  },
];

describe('CreditApplicationList', () => {
  let http: HttpTestingController;

  let notifications: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
  };

  let confirmationService: ConfirmationService;
  let pendingConfirmation: any;

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

    await TestBed.configureTestingModule({
      imports: [CreditApplicationList],
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
          useValue: {
            list: vi.fn(() => of([])),
          },
        },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  async function createList() {
    const fixture = TestBed.createComponent(CreditApplicationList);
    fixture.detectChanges();
    await fixture.whenStable();

    return {
      fixture,
      list: fixture.componentInstance,
    };
  }

  function loadApplications() {
    http.expectOne(BASE).flush({
      credit_applications: APPLICATIONS,
    });
  }

  it('should load credit applications with their associated member names', async () => {
    const { list } = await createList();

    expect(list.loading()).toBe(true);

    loadApplications();

    expect(list.rows()).toEqual(APPLICATIONS);
    expect(list.loading()).toBe(false);
    expect(list.error()).toBeNull();
    expect(list.memberName()(10)).toBe('Ana');
  });

  it('should show an error when credit applications cannot be loaded', async () => {
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
      'No se pudo cargar el listado de solicitudes.',
    );
  });

  it('should use the member identifier when the application has no associated member', async () => {
    const { list } = await createList();

    http.expectOne(BASE).flush({
      credit_applications: [
        {
          ...APPLICATIONS[0],
          member: undefined,
        },
      ],
    });

    expect(list.memberName()(10)).toBe('Socio #10');
  });

  it('should filter applications locally without another API request', async () => {
    const { list } = await createList();
    loadApplications();

    list.filter.set('ANA');

    expect(list.visibleRows()).toEqual([
      APPLICATIONS[0],
      APPLICATIONS[2],
    ]);

    list.filter.set('aprobada');

    expect(list.visibleRows()).toEqual([APPLICATIONS[1]]);

    list.filter.set('100');

    expect(list.visibleRows()).toEqual([APPLICATIONS[0]]);

    http.expectNone(BASE);
  });

  it('should translate application statuses and return their severities', async () => {
    const { list } = await createList();

    expect(list.statusLabel('pending')).toBe('Pendiente');
    expect(list.statusLabel('approved')).toBe('Aprobada');
    expect(list.statusLabel('rejected')).toBe('Rechazada');
    expect(list.statusLabel('cancelled')).toBe('Cancelada');

    expect(list.statusSeverity('pending')).toBe('info');
    expect(list.statusSeverity('approved')).toBe('success');
    expect(list.statusSeverity('rejected')).toBe('danger');
    expect(list.statusSeverity('cancelled')).toBe('secondary');

    http.expectOne(BASE).flush({
      credit_applications: [],
    });
  });

  it('should format amounts as Colombian pesos', async () => {
    const { list } = await createList();

    expect(list.formatAmount(500000)).toContain('500.000');

    http.expectOne(BASE).flush({
      credit_applications: [],
    });
  });

  it('should POST a new credit application and reload the list', async () => {
    const { list } = await createList();
    loadApplications();

    const payload: CreditApplicationPayload = {
      member_id: 10,
      reference_id: 100,
      date: '2026-11-01T00:00:00.000Z',
      amount: 600000,
      observations: 'Nueva solicitud',
    };

    list.openCreate();

    expect(list.title()).toBe('Nueva solicitud de crédito');

    list.save(payload);

    const request = http.expectOne(BASE);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      credit_application: {
        id: 4,
        ...payload,
        status: 'pending',
      },
    });

    expect(list.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith(
      'Solicitud de crédito creada',
    );

    http.expectOne(BASE).flush({
      credit_applications: [...APPLICATIONS],
    });
  });

  it('should PATCH an edited application without sending its status', async () => {
    const { list } = await createList();
    loadApplications();

    list.openEdit(APPLICATIONS[0]);

    expect(list.title()).toBe('Editar solicitud de crédito');

    const payload: CreditApplicationPayload = {
      member_id: 10,
      reference_id: 200,
      date: '2026-10-25T00:00:00.000Z',
      amount: 800000,
      observations: 'Solicitud actualizada',
    };

    list.save(payload);

    const request = http.expectOne(`${BASE}/1`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body).not.toHaveProperty('status');

    request.flush({
      credit_application: {
        ...APPLICATIONS[0],
        ...payload,
      },
    });

    expect(notifications.success).toHaveBeenCalledWith(
      'Solicitud de crédito actualizada',
    );

    http.expectOne(BASE).flush({
      credit_applications: APPLICATIONS,
    });
  });

  it('should PATCH deactivate after confirmation is accepted', async () => {
    const { list } = await createList();
    loadApplications();

    list.cancelApplication(APPLICATIONS[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(pendingConfirmation).toBeTruthy();

    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1/deactivate`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Credit application cancelled',
      credit_application: {
        ...APPLICATIONS[0],
        status: 'cancelled',
      },
    });

    expect(notifications.success).toHaveBeenCalledWith(
      'Solicitud de crédito cancelada',
    );

    http.expectOne(BASE).flush({
      credit_applications: APPLICATIONS,
    });
  });

  it('should not edit an application that is not pending', async () => {
    const { list } = await createList();
    loadApplications();

    list.openEdit(APPLICATIONS[1]);

    expect(list.editing()).toBeNull();
    expect(list.dialogVisible()).toBe(false);

    list.openEdit(APPLICATIONS[2]);

    expect(list.editing()).toBeNull();
    expect(list.dialogVisible()).toBe(false);

    http.expectNone(`${BASE}/2`);
    http.expectNone(`${BASE}/3`);
  });

  it('should not request cancellation for an application that is not pending', async () => {
    const { list } = await createList();
    loadApplications();

    list.cancelApplication(APPLICATIONS[1]);
    list.cancelApplication(APPLICATIONS[2]);

    expect(confirmationService.confirm).not.toHaveBeenCalled();
    http.expectNone(`${BASE}/2/deactivate`);
    http.expectNone(`${BASE}/3/deactivate`);
  });

  it('should not cancel an application when confirmation is rejected', async () => {
    const { list } = await createList();
    loadApplications();

    list.cancelApplication(APPLICATIONS[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${BASE}/1/deactivate`);
  });
});
