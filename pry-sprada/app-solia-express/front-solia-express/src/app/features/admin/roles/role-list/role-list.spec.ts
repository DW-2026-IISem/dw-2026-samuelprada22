import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { Role } from '../../../../core/models/role.model';
import { NotificationService } from '../../../../core/services/notification';
import { RoleList } from './role-list';

const BASE = `${environment.apiUrl}/roles`;

const ROLES: Role[] = [
  {
    id: 1,
    name: 'ADMIN',
    description: 'Administración del sistema',
    status: 'active',
  },
  {
    id: 2,
    name: 'CAJERO',
    description: 'Operaciones de caja',
    status: 'inactive',
  },
];

describe('RoleList', () => {
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
      imports: [RoleList],
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
    http.verify();
    TestBed.resetTestingModule();
  });

  async function crearLista() {
    const fixture = TestBed.createComponent(RoleList);
    fixture.detectChanges();
    await fixture.whenStable();

    return {
      fixture,
      lista: fixture.componentInstance,
    };
  }

  function cargarRoles() {
    http.expectOne(BASE).flush({ roles: ROLES });
  }

  it('should load roles from the API', async () => {
    const { lista } = await crearLista();

    expect(lista.loading()).toBe(true);

    cargarRoles();

    expect(lista.rows()).toEqual(ROLES);
    expect(lista.loading()).toBe(false);
    expect(lista.error()).toBeNull();
  });

  it('should show an error when roles cannot be loaded', async () => {
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
      'No se pudo cargar el listado de roles.',
    );
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });

  it('should filter roles by their fields', async () => {
    const { lista } = await crearLista();
    cargarRoles();

    lista.filter.set('CAJERO');
    expect(lista.visibleRows()).toEqual([ROLES[1]]);

    lista.filter.set('Administración');
    expect(lista.visibleRows()).toEqual([ROLES[0]]);

    lista.filter.set('2');
    expect(lista.visibleRows()).toEqual([ROLES[1]]);
  });

  it('should open the create dialog without an editing role', async () => {
    const { lista } = await crearLista();
    cargarRoles();

    lista.openCreate();

    expect(lista.editing()).toBeNull();
    expect(lista.dialogVisible()).toBe(true);
    expect(lista.title()).toBe('Nuevo rol');
  });

  it('should open the edit dialog with the selected role', async () => {
    const { lista } = await crearLista();
    cargarRoles();

    lista.openEdit(ROLES[0]);

    expect(lista.editing()).toEqual(ROLES[0]);
    expect(lista.dialogVisible()).toBe(true);
    expect(lista.title()).toBe('Editar rol');
  });

  it('should POST a new role and reload the list', async () => {
    const { lista } = await crearLista();
    cargarRoles();

    const payload = {
      name: 'ANALISTA_CREDITO',
      description: 'Análisis de solicitudes de crédito',
      status: 'active' as const,
    };

    lista.openCreate();
    lista.save(payload);

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      role: {
        id: 3,
        ...payload,
      },
    });

    expect(lista.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith('Rol creado');

    http.expectOne(BASE).flush({ roles: ROLES });
  });

  it('should PATCH a role without sending status', async () => {
    const { lista } = await crearLista();
    cargarRoles();

    lista.openEdit(ROLES[0]);

    const payload = {
      name: 'ADMIN_ACTUALIZADO',
      description: 'Descripción actualizada',
    };

    lista.save(payload);

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    expect(request.request.body).not.toHaveProperty('status');

    request.flush({
      role: {
        ...ROLES[0],
        ...payload,
      },
    });

    expect(lista.dialogVisible()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith('Rol actualizado');

    http.expectOne(BASE).flush({ roles: ROLES });
  });

  it('should PATCH deactivate after confirmation is accepted', async () => {
    const { lista } = await crearLista();
    cargarRoles();

    lista.deactivate(ROLES[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();
    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1/deactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({ message: 'Role deactivated' });

    expect(notifications.success).toHaveBeenCalledWith('Rol desactivado');

    http.expectOne(BASE).flush({ roles: [ROLES[1]] });
  });

  it('should DELETE a role after confirmation is accepted', async () => {
    const { lista } = await crearLista();
    cargarRoles();

    lista.remove(ROLES[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();
    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1`);
    expect(request.request.method).toBe('DELETE');

    request.flush({ message: 'Role permanently deleted' });

    expect(notifications.success).toHaveBeenCalledWith('Rol eliminado');

    http.expectOne(BASE).flush({ roles: [ROLES[1]] });
  });

  it('should not deactivate a role when confirmation is rejected', async () => {
    const { lista } = await crearLista();
    cargarRoles();

    lista.deactivate(ROLES[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${BASE}/1/deactivate`);
  });

  it('should not delete a role when confirmation is rejected', async () => {
    const { lista } = await crearLista();
    cargarRoles();

    lista.remove(ROLES[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${BASE}/1`);
  });
});
