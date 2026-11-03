import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../../environments/environment';
import { CommitteeDecision } from '../../../core/models/committee-decision.model';
import { CreditApplication } from '../../../core/models/credit-application.model';
import { Member } from '../../../core/models/member.model';
import { NotificationService } from '../../../core/services/notification';
import { CommitteeDecisionList } from './committee-decision-list';

const DECISIONS_URL = `${environment.apiUrl}/committee-decisions`;
const APPLICATIONS_URL = `${environment.apiUrl}/credit-applications`;
const MEMBERS_URL = `${environment.apiUrl}/members`;

const DECISIONS: CommitteeDecision[] = [
  {
    id: 1,
    credit_application_id: 10,
    decision: 'approved',
    decision_date: '2026-11-02',
    comments: 'Aprobada por el comité',
    decided_by: 2,
    status: 'active',
  },
  {
    id: 2,
    credit_application_id: 12,
    decision: 'observed',
    decision_date: null,
    comments: 'Falta documentación',
    decided_by: null,
    status: 'active',
  },
];

const APPLICATIONS: CreditApplication[] = [
  {
    id: 10,
    member_id: 1,
    reference_id: null,
    date: '2026-11-01',
    amount: 5000000,
    status: 'pending',
    observations: null,
  },
  {
    id: 11,
    member_id: 2,
    reference_id: null,
    date: '2026-11-02',
    amount: 3000000,
    status: 'pending',
    observations: null,
  },
  {
    id: 12,
    member_id: 2,
    reference_id: null,
    date: '2026-11-03',
    amount: 7000000,
    status: 'pending',
    observations: null,
  },
  {
    id: 13,
    member_id: 2,
    reference_id: null,
    date: '2026-11-04',
    amount: 2000000,
    status: 'approved',
    observations: null,
  },
];

const MEMBERS: Member[] = [
  {
    id: 1,
    name: 'Ana',
    description: 'Socio principal',
    isActive: true,
  },
  {
    id: 2,
    name: 'Samuel',
    description: null,
    isActive: true,
  },
];

describe('CommitteeDecisionList', () => {
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
      imports: [CommitteeDecisionList],
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
    const fixture = TestBed.createComponent(CommitteeDecisionList);

    fixture.detectChanges();
    await fixture.whenStable();

    return {
      fixture,
      list: fixture.componentInstance,
    };
  }

  function loadData(
    decisions: CommitteeDecision[] = DECISIONS,
    applications: CreditApplication[] = APPLICATIONS,
    members: Member[] = MEMBERS,
  ) {
    http.expectOne(DECISIONS_URL).flush({
      committee_decisions: decisions,
    });

    http.expectOne(APPLICATIONS_URL).flush({
      credit_applications: applications,
    });

    http.expectOne(MEMBERS_URL).flush({
      members,
    });
  }

  it('should load decisions, applications and members', async () => {
    const { list } = await createList();

    expect(list.loading()).toBe(true);

    loadData();

    expect(list.rows()).toEqual(DECISIONS);
    expect(list.applications()).toEqual(APPLICATIONS);
    expect(list.members()).toEqual(MEMBERS);
    expect(list.loading()).toBe(false);
    expect(list.error()).toBeNull();
  });

  it('should show an error when decisions cannot be loaded', async () => {
    const { fixture, list } = await createList();

    http.expectOne(DECISIONS_URL).flush(
      { message: 'Server error' },
      { status: 500, statusText: 'Server Error' },
    );

    // forkJoin cancela las peticiones secundarias cuando falla la principal.
    fixture.detectChanges();

    expect(list.rows()).toEqual([]);
    expect(list.loading()).toBe(false);
    expect(list.error()).toBeTruthy();
  });

  it('should continue loading decisions when applications or members fail', async () => {
    const { list } = await createList();

    http.expectOne(DECISIONS_URL).flush({
      committee_decisions: DECISIONS,
    });

    http.expectOne(APPLICATIONS_URL).flush(
      { message: 'Applications unavailable' },
      { status: 500, statusText: 'Server Error' },
    );

    http.expectOne(MEMBERS_URL).flush(
      { message: 'Members unavailable' },
      { status: 500, statusText: 'Server Error' },
    );

    expect(list.rows()).toEqual(DECISIONS);
    expect(list.applications()).toEqual([]);
    expect(list.members()).toEqual([]);
    expect(list.applicationsError()).toBe(true);
    expect(list.membersError()).toBe(true);
    expect(list.loading()).toBe(false);
  });

  it('should filter decisions by id, application, member, decision and comments', async () => {
    const { list } = await createList();
    loadData();

    list.filter.set('Solicitud #10');
    expect(list.visibleRows()).toEqual([DECISIONS[0]]);

    list.filter.set('Samuel');
    expect(list.visibleRows()).toEqual([DECISIONS[1]]);

    list.filter.set('observada');
    expect(list.visibleRows()).toEqual([DECISIONS[1]]);

    list.filter.set('documentación');
    expect(list.visibleRows()).toEqual([DECISIONS[1]]);
  });

  it('should translate decision values into Spanish labels', async () => {
    const { list } = await createList();

    expect(list.decisionLabel('pending')).toBe('Pendiente');
    expect(list.decisionLabel('approved')).toBe('Aprobada');
    expect(list.decisionLabel('rejected')).toBe('Rechazada');
    expect(list.decisionLabel('observed')).toBe('Observada');

    loadData([]);
  });

  it('should resolve application and member information', async () => {
    const { list } = await createList();
    loadData();

    expect(list.applicationLabel(10)).toBe('Solicitud #10');
    expect(list.memberName(10)).toBe('Ana');
    expect(list.applicationAmount(10)).toContain('$');
    expect(list.memberName(999)).toBe('Socio no disponible');
    expect(list.applicationLabel(999)).toBe('Solicitud #999');
    expect(list.applicationAmount(999)).toBe('—');
  });

  it('should exclude applications that already have an active decision', async () => {
    const { list } = await createList();
    loadData();

    expect(list.pendingApplications()).toEqual([
      APPLICATIONS[1],
      APPLICATIONS[3 - 1],
    ].filter((application) => application.id === 11));
  });

  it('should open the create dialog when an undecided pending application exists', async () => {
    const { list } = await createList();
    loadData();

    list.openCreate();

    expect(list.title()).toBe('Nueva decisión del comité');
    expect(list.editing()).toBeNull();
    expect(list.dialogVisible()).toBe(true);
    expect(list.formApplications().map((application) => application.id))
      .toEqual([11]);
  });

  it('should warn when there are no pending applications available', async () => {
    const { list } = await createList();

    loadData(DECISIONS, [
      ...APPLICATIONS.filter((application) => application.id !== 11),
    ]);

    list.openCreate();

    expect(list.dialogVisible()).toBe(false);
    expect(notifications.warn).toHaveBeenCalledWith(
      'No hay solicitudes pendientes para decidir',
    );
  });

  it('should keep all applications available when editing a decision', async () => {
    const { list } = await createList();
    loadData();

    list.openEdit(DECISIONS[0]);

    expect(list.title()).toBe('Editar decisión');
    expect(list.editing()).toEqual(DECISIONS[0]);
    expect(list.formApplications()).toEqual(APPLICATIONS);
  });

  it('should POST a new committee decision and reload the list', async () => {
    const { list } = await createList();
    loadData();

    const payload = {
      credit_application_id: 11,
      decision: 'approved' as const,
      decision_date: '2026-11-02',
      comments: 'Aprobada por el comité',
    };

    list.openCreate();
    list.save(payload);

    const request = http.expectOne(DECISIONS_URL);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      committee_decision: {
        id: 3,
        ...payload,
        decided_by: null,
        status: 'active',
      },
    });

    expect(list.saving()).toBe(false);
    expect(list.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith(
      'Decisión registrada',
    );

    loadData([
      ...DECISIONS,
      {
        id: 3,
        ...payload,
        decided_by: null,
        status: 'active',
      },
    ]);
  });

  it('should PATCH an edited decision without changing its status', async () => {
    const { list } = await createList();
    loadData();

    const payload = {
      credit_application_id: 10,
      decision: 'observed' as const,
      decision_date: null,
      comments: 'Se requiere documentación adicional',
    };

    list.openEdit(DECISIONS[0]);
    list.save(payload);

    const request = http.expectOne(`${DECISIONS_URL}/1`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body).not.toHaveProperty('status');

    request.flush({
      committee_decision: {
        ...DECISIONS[0],
        ...payload,
      },
    });

    expect(list.saving()).toBe(false);
    expect(list.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith(
      'Decisión actualizada',
    );

    loadData([
      { ...DECISIONS[0], ...payload },
      DECISIONS[1],
    ]);
  });

  it('should cancel a decision only after confirmation is accepted', async () => {
    const { list } = await createList();
    loadData();

    list.deactivate(DECISIONS[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(pendingConfirmation).toBeTruthy();

    pendingConfirmation.accept();

    const request = http.expectOne(`${DECISIONS_URL}/1/deactivate`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Committee decision cancelled',
      committee_decision: {
        ...DECISIONS[0],
        status: 'cancelled',
      },
    });

    expect(notifications.success).toHaveBeenCalledWith(
      'Decisión cancelada',
    );

    loadData([DECISIONS[1]]);
  });

  it('should not cancel a decision when confirmation is rejected', async () => {
    const { list } = await createList();
    loadData();

    list.deactivate(DECISIONS[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${DECISIONS_URL}/1/deactivate`);
  });
});
