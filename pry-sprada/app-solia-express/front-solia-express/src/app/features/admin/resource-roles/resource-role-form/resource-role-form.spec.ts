import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { Resource } from '../../../../core/models/resource.model';
import { Role } from '../../../../core/models/role.model';
import { ResourceApi } from '../../resources/resource-api';
import { RoleApi } from '../../roles/role-api';
import { ResourceRoleForm } from './resource-role-form';

const ROLES: Role[] = [
  {
    id: 1,
    name: 'ADMIN',
    description: 'Administración',
    status: 'active',
  },
  {
    id: 2,
    name: 'AUDITOR',
    description: 'Auditoría',
    status: 'inactive',
  },
];

const RESOURCES: Resource[] = [
  {
    id: 1,
    method: 'GET',
    path: '/api/usuarios',
    description: 'Listar usuarios',
    status: 'active',
  },
  {
    id: 2,
    method: 'POST',
    path: '/api/usuarios',
    description: 'Crear usuario',
    status: 'inactive',
  },
];

describe('ResourceRoleForm', () => {
  let roleApi: { list: ReturnType<typeof vi.fn> };
  let resourceApi: { list: ReturnType<typeof vi.fn> };

  async function createForm() {
    roleApi = {
      list: vi.fn().mockReturnValue(of(ROLES)),
    };
    resourceApi = {
      list: vi.fn().mockReturnValue(of(RESOURCES)),
    };

    await TestBed.configureTestingModule({
      imports: [ResourceRoleForm],
      providers: [
        { provide: RoleApi, useValue: roleApi },
        { provide: ResourceApi, useValue: resourceApi },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<ResourceRoleForm> =
      TestBed.createComponent(ResourceRoleForm);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return {
      fixture,
      form: fixture.componentInstance,
    };
  }

  it('should initialize with empty grant fields', async () => {
    const { form } = await createForm();

    expect(form.form.getRawValue()).toEqual({
      role_id: 0,
      resource_id: 0,
    });
  });

  it('should load only active roles and resources', async () => {
    const { form } = await createForm();

    expect(form.roles()).toEqual([ROLES[0]]);
    expect(form.resources()).toEqual([RESOURCES[0]]);
    expect(form.catalogLoading()).toBe(false);
    expect(roleApi.list).toHaveBeenCalledOnce();
    expect(resourceApi.list).toHaveBeenCalledOnce();
  });

  it('should build resource labels with HTTP method and path', async () => {
    const { form } = await createForm();

    expect(form.resourceOptions()).toEqual([
      {
        ...RESOURCES[0],
        label: 'GET · /api/usuarios',
      },
    ]);
  });

  it('should reject a grant without a role', async () => {
    const { form } = await createForm();
    let emitted = false;

    form.saved.subscribe(() => {
      emitted = true;
    });

    form.form.controls.resource_id.setValue(1);
    form.submit();

    expect(form.form.controls.role_id.invalid).toBe(true);
    expect(form.form.controls.role_id.touched).toBe(true);
    expect(emitted).toBe(false);
  });

  it('should reject a grant without a resource', async () => {
    const { form } = await createForm();
    let emitted = false;

    form.saved.subscribe(() => {
      emitted = true;
    });

    form.form.controls.role_id.setValue(1);
    form.submit();

    expect(form.form.controls.resource_id.invalid).toBe(true);
    expect(form.form.controls.resource_id.touched).toBe(true);
    expect(emitted).toBe(false);
  });

  it('should emit only role_id and resource_id', async () => {
    const { form } = await createForm();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      role_id: 1,
      resource_id: 1,
    });

    form.submit();

    expect(payload).toEqual({
      role_id: 1,
      resource_id: 1,
    });
  });

  it('should reset the form when resetKey changes', async () => {
    const { fixture, form } = await createForm();

    form.form.setValue({
      role_id: 1,
      resource_id: 1,
    });

    fixture.componentRef.setInput('resetKey', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      role_id: 0,
      resource_id: 0,
    });
  });

  it('should not emit while saving', async () => {
    const { fixture, form } = await createForm();
    let emitted = false;

    form.saved.subscribe(() => {
      emitted = true;
    });

    fixture.componentRef.setInput('saving', true);
    fixture.detectChanges();

    form.form.setValue({
      role_id: 1,
      resource_id: 1,
    });

    form.submit();

    expect(emitted).toBe(false);
  });

  it('should prevent submission when there are no active roles', async () => {
    const { form } = await createForm();
    form.roles.set([]);

    form.form.setValue({
      role_id: 1,
      resource_id: 1,
    });

    let emitted = false;
    form.saved.subscribe(() => {
      emitted = true;
    });

    form.submit();

    expect(emitted).toBe(false);
  });

  it('should prevent submission when there are no active resources', async () => {
    const { form } = await createForm();
    form.resources.set([]);

    form.form.setValue({
      role_id: 1,
      resource_id: 1,
    });

    let emitted = false;
    form.saved.subscribe(() => {
      emitted = true;
    });

    form.submit();

    expect(emitted).toBe(false);
  });

  it('should expose an error when catalog loading fails', async () => {
    roleApi = {
      list: vi.fn().mockReturnValue(
        throwError(() => new Error('Network error')),
      ),
    };
    resourceApi = {
      list: vi.fn().mockReturnValue(of(RESOURCES)),
    };

    await TestBed.configureTestingModule({
      imports: [ResourceRoleForm],
      providers: [
        { provide: RoleApi, useValue: roleApi },
        { provide: ResourceApi, useValue: resourceApi },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ResourceRoleForm);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.catalogLoading()).toBe(false);
    expect(fixture.componentInstance.catalogError()).toBeTruthy();
    expect(fixture.componentInstance.roles()).toEqual([]);
  });
});
