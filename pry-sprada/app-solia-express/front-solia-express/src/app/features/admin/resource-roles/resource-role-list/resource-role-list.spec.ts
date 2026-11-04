import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { ResourceRole } from '../../../../core/models/resource-role.model';
import { NotificationService } from '../../../../core/services/notification';
import { ResourceRoleList } from './resource-role-list';

const BASE = `${environment.apiUrl}/concesiones-rol`;

const GRANTS: ResourceRole[] = [
  {
    id: 1,
    role_id: 1,
    resource_id: 2,
    status: 'active',
    createdAt: '2026-11-03T10:00:00.000Z',
    role: { id: 1, name: 'ADMIN' },
    resource: {
      id: 2,
      method: 'GET',
      path: '/api/usuarios',
      description: 'Listar usuarios',
    },
  },
  {
    id: 2,
    role_id: 2,
    resource_id: 5,
    status: 'active',
    createdAt: '2026-11-03T11:00:00.000Z',
    role: { id: 2, name: 'CAJERO' },
    resource: {
      id: 5,
      method: 'POST',
      path: '/api/movements',
      description: 'Registrar movimiento',
    },
  },
];

describe('ResourceRoleList', () => {
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
      imports: [ResourceRoleList],
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
    const fixture = TestBed.createComponent(ResourceRoleList);
    fixture.detectChanges();
    await fixture.whenStable();

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

    http.expectOne(`${environment.apiUrl}/recursos`).flush({
      resources: [
        {
          id: 2,
          method: 'GET',
          path: '/api/usuarios',
          description: 'Listar usuarios',
          status: 'active',
        },
      ],
    });

    return {
      fixture,
      lista: fixture.componentInstance,
    };
  }

  function cargarConcesiones(grants = GRANTS) {
    http.expectOne(BASE).flush({ grants });
  }

  it('should load active grants from the API', async () => {
    const { lista } = await crearLista();

    expect(lista.loading()).toBe(true);
    cargarConcesiones();

    expect(lista.rows()).toEqual(GRANTS);
    expect(lista.loading()).toBe(false);
    expect(lista.error()).toBeNull();
  });

  it('should show an error when grants cannot be loaded', async () => {
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
      'No se pudo cargar el listado de concesiones.',
    );
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });

  it('should filter grants by role, method, path and identifiers', async () => {
    const { lista } = await crearLista();
    cargarConcesiones();

    lista.filter.set('CAJERO');
    expect(lista.visibleRows()).toEqual([GRANTS[1]]);

    lista.filter.set('POST');
    expect(lista.visibleRows()).toEqual([GRANTS[1]]);

    lista.filter.set('/api/usuarios');
    expect(lista.visibleRows()).toEqual([GRANTS[0]]);

    lista.filter.set('ADMIN');
    expect(lista.visibleRows()).toEqual([GRANTS[0]]);

    lista.filter.set('2');
    expect(lista.visibleRows()).toEqual(GRANTS);
  });

  it('should open the create dialog and increment resetKey', async () => {
    const { lista } = await crearLista();
    cargarConcesiones();

    const initialKey = lista.resetKey();
    lista.openCreate();

    expect(lista.dialogVisible()).toBe(true);
    expect(lista.resetKey()).toBe(initialKey + 1);
  });

  it('should POST a grant and reload the list', async () => {
    const { lista } = await crearLista();
    cargarConcesiones();

    const payload = { role_id: 2, resource_id: 5 };
    lista.openCreate();
    lista.save(payload);

    const request = http.expectOne(BASE);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({
      message: 'Resource granted to role',
      grant: {
        id: 3,
        ...payload,
        status: 'active',
      },
    });

    expect(lista.dialogVisible()).toBe(false);
    expect(lista.saving()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith(
      'Concesión registrada correctamente',
    );

    http.expectOne(BASE).flush({ grants: GRANTS });
  });

  it('should show an error when a grant cannot be created', async () => {
    const { lista } = await crearLista();
    cargarConcesiones();

    lista.openCreate();
    lista.save({ role_id: 2, resource_id: 5 });

    http.expectOne(BASE).flush(
      { error: 'Role already has this resource granted' },
      { status: 409, statusText: 'Conflict' },
    );

    expect(lista.dialogVisible()).toBe(true);
    expect(lista.saving()).toBe(false);
    expect(notifications.error).toHaveBeenCalledWith(
      'No se pudo conceder el recurso al rol',
      expect.any(String),
    );
  });

  it('should PATCH deactivate after confirmation is accepted', async () => {
    const { lista } = await crearLista();
    cargarConcesiones();

    lista.deactivate(GRANTS[0]);

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(pendingConfirmation.message).toContain('ADMIN');
    expect(pendingConfirmation.message).toContain('GET');
    expect(pendingConfirmation.message).toContain('/api/usuarios');
    pendingConfirmation.accept();

    const request = http.expectOne(`${BASE}/1/deactivate`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});

    request.flush({
      message: 'Grant deactivated (permission revoked)',
    });

    expect(notifications.success).toHaveBeenCalledWith(
      'Permiso revocado correctamente',
    );
    http.expectOne(BASE).flush({ grants: [GRANTS[1]] });
  });

  it('should not deactivate a grant when confirmation is rejected', async () => {
    const { lista } = await crearLista();
    cargarConcesiones();

    lista.deactivate(GRANTS[0]);

    expect(pendingConfirmation).toBeTruthy();
    http.expectNone(`${BASE}/1/deactivate`);
  });

  it('should show an error when a grant cannot be deactivated', async () => {
    const { lista } = await crearLista();
    cargarConcesiones();

    lista.deactivate(GRANTS[0]);
    pendingConfirmation.accept();

    http.expectOne(`${BASE}/1/deactivate`).flush(
      { error: 'Forbidden' },
      { status: 403, statusText: 'Forbidden' },
    );

    expect(notifications.error).toHaveBeenCalledWith(
      'No se pudo revocar el permiso',
      expect.any(String),
    );
  });
});
