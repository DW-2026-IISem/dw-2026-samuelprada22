import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { AuthSession } from '../../../../core/services/auth-session';
import { NotificationService } from '../../../../core/services/notification';
import { ResourceRole } from '../../../../core/models/resource-role.model';
import { ResourceRoleList } from './resource-role-list';

const API = environment.apiUrl;
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
      path: '/api/members',
      description: 'Listar socios',
    },
  },
  {
    id: 2,
    role_id: 1,
    resource_id: 3,
    status: 'active',
    createdAt: '2026-11-03T10:00:00.000Z',
    role: { id: 1, name: 'ADMIN' },
    resource: {
      id: 3,
      method: 'GET',
      path: '/api/members/:id',
      description: 'Consultar socio',
    },
  },
  {
    id: 3,
    role_id: 1,
    resource_id: 9,
    status: 'active',
    createdAt: '2026-11-03T10:00:00.000Z',
    role: { id: 1, name: 'ADMIN' },
    resource: {
      id: 9,
      method: 'PATCH',
      path: '/api/users/:id/password',
      description: 'Cambiar contraseña',
    },
  },
  {
    id: 4,
    role_id: 2,
    resource_id: 4,
    status: 'active',
    createdAt: '2026-11-03T11:00:00.000Z',
    role: { id: 2, name: 'CAJERO' },
    resource: {
      id: 4,
      method: 'POST',
      path: '/api/members',
      description: 'Crear socio',
    },
  },
];

const ROLES = [
  {
    id: 1,
    name: 'ADMIN',
    description: 'Administración general',
    status: 'active',
  },
  {
    id: 2,
    name: 'CAJERO',
    description: 'Gestión de caja',
    status: 'active',
  },
];

const RESOURCES = [
  { id: 2, method: 'GET', path: '/api/members', description: 'Listar socios', status: 'active' },
  { id: 3, method: 'GET', path: '/api/members/:id', description: 'Consultar socio', status: 'active' },
  { id: 4, method: 'POST', path: '/api/members', description: 'Crear socio', status: 'active' },
  { id: 5, method: 'PUT', path: '/api/members/:id', description: 'Actualizar socio', status: 'active' },
  { id: 6, method: 'PATCH', path: '/api/members/:id', description: 'Modificar socio', status: 'active' },
  { id: 7, method: 'DELETE', path: '/api/members/:id', description: 'Eliminar socio', status: 'active' },
  { id: 8, method: 'PATCH', path: '/api/members/:id/deactivate', description: 'Desactivar socio', status: 'active' },
  { id: 9, method: 'PATCH', path: '/api/users/:id/password', description: 'Cambiar contraseña', status: 'active' },
];

describe('ResourceRoleList', () => {
  let http: HttpTestingController;
  let notifications: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    notifications = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ResourceRoleList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notifications },
        {
          provide: AuthSession,
          useValue: { canPermission: vi.fn(() => true) },
        },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify({ ignoreCancelled: true });
    TestBed.resetTestingModule();
  });

  function responderCarga(grants = GRANTS) {
    http.expectOne(`${API}/roles`).flush({ roles: ROLES });
    http.expectOne(`${API}/recursos`).flush({ resources: RESOURCES });
    http.expectOne(`${API}/concesiones-rol`).flush({ grants });
  }

  function crearLista(grants = GRANTS) {
    const fixture = TestBed.createComponent(ResourceRoleList);
    fixture.detectChanges();
    responderCarga(grants);
    fixture.detectChanges();

    return { fixture, lista: fixture.componentInstance };
  }

  it('should load active roles, resources and grants', () => {
    const { lista } = crearLista();

    expect(lista.loading()).toBe(false);
    expect(lista.roles()).toHaveLength(2);
    expect(lista.resources()).toHaveLength(8);
    expect(lista.grants()).toEqual(GRANTS);
    expect(lista.selectedRoleId()).toBe(1);
    expect(lista.error()).toBeNull();
  });

  it('should build CRUD operations from standard resource routes', () => {
    const { lista } = crearLista();

    expect(lista.groups()).toHaveLength(1);
    expect(lista.groups()[0].key).toBe('members');
    expect(lista.groups()[0].operations.map((item) => item.code)).toEqual([
      'C', 'R', 'U', 'D',
    ]);

    const read = lista.groups()[0].operations.find((item) => item.code === 'R');
    const update = lista.groups()[0].operations.find((item) => item.code === 'U');

    expect(read?.resourceIds).toEqual([2, 3]);
    expect(update?.resourceIds).toEqual([5, 6]);
  });

  it('should exclude special routes from CRUD operations', () => {
    const { lista } = crearLista();

    const ids = lista.groups().flatMap((group) =>
      group.operations.flatMap((operation) => operation.resourceIds),
    );

    expect(ids).not.toContain(8);
    expect(ids).not.toContain(9);
  });

  it('should restore the selected role permissions', () => {
    const { lista } = crearLista();

    expect(lista.selectedResourceIds()).toEqual([2, 3]);
    expect(lista.selectedRole()?.description).toBe('Administración general');
  });

  it('should select or clear all resource operations', () => {
    const { lista } = crearLista();

    lista.markAll();

    expect(lista.selectedResourceIds().sort((a, b) => a - b)).toEqual([
      2, 3, 4, 5, 6, 7,
    ]);

    lista.clearAll();

    expect(lista.selectedResourceIds()).toEqual([]);
  });

  it('should toggle all resource IDs associated with one operation', () => {
    const { lista } = crearLista();

    const read = lista.groups()[0].operations.find((item) => item.code === 'R')!;

    lista.toggleOperation(read, false);
    expect(lista.selectedResourceIds()).toEqual([]);

    lista.toggleOperation(read, true);
    expect(lista.selectedResourceIds().sort((a, b) => a - b)).toEqual([2, 3]);
    expect(lista.isOperationSelected(read)).toBe(true);
  });

  it('should load permissions when changing the selected role', () => {
    const { lista } = crearLista();

    lista.onRoleChange(2);

    expect(lista.selectedRoleId()).toBe(2);
    expect(lista.selectedRole()?.name).toBe('CAJERO');
    expect(lista.selectedResourceIds()).toEqual([4]);
  });

  it('should preserve special grants when saving the matrix', () => {
    const { lista } = crearLista();

    lista.clearAll();
    lista.save();

    const request = http.expectOne(`${API}/concesiones-rol/roles/1`);

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      resource_ids: [9],
    });

    request.flush({
      message: 'Role permissions reconciled successfully',
      result: {
        role_id: 1,
        activated: 0,
        deactivated: 2,
        total_active: 1,
      },
    });

    expect(notifications.success).toHaveBeenCalledWith(
      'Permisos del rol guardados correctamente',
    );

    responderCarga([GRANTS[2]]);
    expect(lista.saving()).toBe(false);
  });

  it('should save selected CRUD permissions together with special grants', () => {
    const { lista } = crearLista();

    lista.markAll();
    lista.save();

    const request = http.expectOne(`${API}/concesiones-rol/roles/1`);

    expect(request.request.method).toBe('PUT');
    expect(request.request.body.resource_ids.sort((a: number, b: number) => a - b))
      .toEqual([2, 3, 4, 5, 6, 7, 9]);

    request.flush({
      message: 'Role permissions reconciled successfully',
      result: {
        role_id: 1,
        activated: 4,
        deactivated: 0,
        total_active: 7,
      },
    });

    responderCarga(GRANTS);
    expect(lista.saving()).toBe(false);
  });

  it('should report an error when saving permissions fails', () => {
    const { lista } = crearLista();

    lista.save();

    http.expectOne(`${API}/concesiones-rol/roles/1`).flush(
      { message: 'Forbidden' },
      { status: 403, statusText: 'Forbidden' },
    );

    expect(lista.saving()).toBe(false);
    expect(notifications.error).toHaveBeenCalledWith(
      'No se pudieron guardar los permisos',
      expect.any(String),
    );
  });

  it('should show an error when initial data cannot be loaded', () => {
    const fixture = TestBed.createComponent(ResourceRoleList);
    fixture.detectChanges();

    http.expectOne(`${API}/roles`).flush(
      { message: 'Server error' },
      { status: 500, statusText: 'Server Error' },
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.componentInstance.error()).toBeTruthy();
    expect(fixture.componentInstance.roles()).toEqual([]);
  });
});
