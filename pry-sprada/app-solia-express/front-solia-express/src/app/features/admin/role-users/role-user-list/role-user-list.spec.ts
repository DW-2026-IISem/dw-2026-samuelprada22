import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { RoleUser } from '../../../../core/models/role-user.model';
import { NotificationService } from '../../../../core/services/notification';
import { RoleUserList } from './role-user-list';

const BASE = `${environment.apiUrl}/asignaciones-rol`;

const ASSIGNMENTS: RoleUser[] = [
  {
    id: 1,
    user_id: 2,
    role_id: 1,
    status: 'active',
    createdAt: '2026-11-03T10:00:00.000Z',
    user: { id: 2, username: 'admin', email: 'admin@solia.test' },
    role: { id: 1, name: 'ADMIN' },
  },
  {
    id: 2,
    user_id: 3,
    role_id: 2,
    status: 'active',
    createdAt: '2026-11-03T11:00:00.000Z',
    user: { id: 3, username: 'cajero', email: 'cajero@solia.test' },
    role: { id: 2, name: 'CAJERO' },
  },
];

describe('RoleUserList', () => {
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
      imports: [RoleUserList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notifications },
        { provide: ConfirmationService, useValue: confirmationService },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  async function crearLista() {
    const fixture = TestBed.createComponent(RoleUserList);
    fixture.detectChanges();
    await fixture.whenStable();

    http.expectOne(`${environment.apiUrl}/usuarios`).flush({
      users: [
        {
          id: 2,
          username: 'admin',
          email: 'admin@solia.test',
          avatar: null,
          status: 'active',
        },
      ],
    });

    http.expectOne(`${environment.apiUrl}/roles`).flush({
      roles: [
        {
          id: 1,
          name: 'ADMIN',
          description: 'Administración',
          status: 'active',
        },
      ],
    });

    return {
      fixture,
      lista: fixture.componentInstance,
    };
  }

  function cargarAsignaciones(assignments = ASSIGNMENTS) {
    http.expectOne(BASE).flush({ assignments });
  }

  it('should load active assignments from the API', async () => {
    const { lista } = await crearLista();

    expect(lista.loading()).toBe(true);
    cargarAsignaciones();

    expect(lista.rows()).toEqual(ASSIGNMENTS);
    expect(lista.loading()).toBe(false);
    expect(lista.error()).toBeNull();
  });

  it('should show an error when assignments cannot be loaded', async () => {
    const { fixture, lista } = await crearLista();

    http.expectOne(BASE).flush(
      { message: 'Server error' },
      { status: 500, statusText: 'Server Error' },
    );
    fixture.detectChanges();

    expect(lista.rows()).toEqual([]);
    expect(lista.loading()).toBe(false);
    expect(lista.error()).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain(
      'No se pudo cargar el listado de asignaciones.',
    );
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });

  it('should filter assignments by user, email, role and identifiers', async () => {
    const { lista } = await crearLista();
    cargarAsignaciones();

    lista.filter.set('CAJERO');
    expect(lista.visibleRows()).toEqual([ASSIGNMENTS[1]]);

    lista.filter.set('admin@solia.test');
    expect(lista.visibleRows()).toEqual([ASSIGNMENTS[0]]);

    lista.filter.set('ADMIN');
    expect(lista.visibleRows()).toEqual([ASSIGNMENTS[0]]);

    lista.filter.set('2');
    expect(lista.visibleRows()).toEqual(ASSIGNMENTS);
  });

  it('should open the create dialog and increment resetKey', async () => {
    const { lista } = await crearLista();
    cargarAsignaciones();

    const initialKey = lista.resetKey();
    lista.openCreate();

    expect(lista.dialogVisible()).toBe(true);
    expect(lista.resetKey()).toBe(initialKey + 1);
  });

  it('should POST a new assignment and reload the list', async () => {
    const { lista } = await crearLista();
    cargarAsignaciones();

    const payload = { user_id: 4, role_id: 2 };
    lista.openCreate();
    lista.save(payload);

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      assignment: {
        id: 3,
        ...payload,
        status: 'active',
      },
    });

    expect(lista.dialogVisible()).toBe(false);
    expect(lista.saving()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith(
      'Rol asignado correctamente',
    );

    http.expectOne(BASE).flush({ assignments: ASSIGNMENTS });
  });

  it('should show an error when an assignment cannot be created', async () => {
    const { lista } = await crearLista();
    cargarAsignaciones();

    lista.openCreate();
    lista.save({ user_id: 4, role_id: 2 });

    http.expectOne(BASE).flush(
      { error: 'Role is already assigned to this user' },
      { status: 409, statusText: 'Conflict' },
    );

    expect(lista.dialogVisible()).toBe(true);
    expect(lista.saving()).toBe(false);
    expect(notifications.error).toHaveBeenCalledWith(
      'No se pudo asignar el rol',
      expect.any(String),
    );
  });

  it('should PATCH deactivate after confirmation is accepted', async () => {
    const { lista } = await crearLista();
    cargarAsignaciones();

    lista.deactivate(ASSIGNMENTS[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(pendingConfirmation.message).toContain('ADMIN');
    expect(pendingConfirmation.message).toContain('admin');
    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1/deactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({ message: 'Role assignment deactivated' });

    expect(notifications.success).toHaveBeenCalledWith(
      'Asignación desactivada',
    );
    http.expectOne(BASE).flush({ assignments: [ASSIGNMENTS[1]] });
  });

  it('should not deactivate an assignment when confirmation is rejected', async () => {
    const { lista } = await crearLista();
    cargarAsignaciones();

    lista.deactivate(ASSIGNMENTS[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${BASE}/1/deactivate`);
  });

  it('should show an error when an assignment cannot be deactivated', async () => {
    const { lista } = await crearLista();
    cargarAsignaciones();

    lista.deactivate(ASSIGNMENTS[0]);
    pendingConfirmation.accept();

    http.expectOne(`${BASE}/1/deactivate`).flush(
      { error: 'Forbidden' },
      { status: 403, statusText: 'Forbidden' },
    );

    expect(notifications.error).toHaveBeenCalledWith(
      'No se pudo desactivar la asignación',
      expect.any(String),
    );
  });
});
