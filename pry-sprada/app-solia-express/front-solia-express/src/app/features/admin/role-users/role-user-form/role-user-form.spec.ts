import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { Role } from '../../../../core/models/role.model';
import { User } from '../../../../core/models/user.model';
import { RoleApi } from '../../roles/role-api';
import { UserApi } from '../../users/user-api';
import { RoleUserForm } from './role-user-form';

const USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@solia.test',
    avatar: null,
    status: 'active',
  },
  {
    id: 2,
    username: 'inactivo',
    email: 'inactivo@solia.test',
    avatar: null,
    status: 'inactive',
  },
];

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

describe('RoleUserForm', () => {
  let userApi: { list: ReturnType<typeof vi.fn> };
  let roleApi: { list: ReturnType<typeof vi.fn> };

  async function createForm() {
    userApi = { list: vi.fn().mockReturnValue(of(USERS)) };
    roleApi = { list: vi.fn().mockReturnValue(of(ROLES)) };

    await TestBed.configureTestingModule({
      imports: [RoleUserForm],
      providers: [
        { provide: UserApi, useValue: userApi },
        { provide: RoleApi, useValue: roleApi },
      ],
    }).compileComponents();

    const fixture: ComponentFixture<RoleUserForm> =
      TestBed.createComponent(RoleUserForm);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, form: fixture.componentInstance };
  }

  it('should initialize with empty assignment fields', async () => {
    const { form } = await createForm();

    expect(form.form.getRawValue()).toEqual({
      user_id: 0,
      role_id: 0,
    });
  });

  it('should load only active users and roles', async () => {
    const { form } = await createForm();

    expect(form.users()).toEqual([USERS[0]]);
    expect(form.roles()).toEqual([ROLES[0]]);
    expect(form.catalogLoading()).toBe(false);
    expect(userApi.list).toHaveBeenCalledOnce();
    expect(roleApi.list).toHaveBeenCalledOnce();
  });

  it('should reject an assignment without a user', async () => {
    const { form } = await createForm();
    let emitted = false;

    form.saved.subscribe(() => {
      emitted = true;
    });

    form.form.controls.role_id.setValue(1);
    form.submit();

    expect(form.form.controls.user_id.invalid).toBe(true);
    expect(form.form.controls.user_id.touched).toBe(true);
    expect(emitted).toBe(false);
  });

  it('should reject an assignment without a role', async () => {
    const { form } = await createForm();
    let emitted = false;

    form.saved.subscribe(() => {
      emitted = true;
    });

    form.form.controls.user_id.setValue(1);
    form.submit();

    expect(form.form.controls.role_id.invalid).toBe(true);
    expect(form.form.controls.role_id.touched).toBe(true);
    expect(emitted).toBe(false);
  });

  it('should emit only user_id and role_id', async () => {
    const { form } = await createForm();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      user_id: 1,
      role_id: 1,
    });

    form.submit();

    expect(payload).toEqual({
      user_id: 1,
      role_id: 1,
    });
  });

  it('should reset the form when resetKey changes', async () => {
    const { fixture, form } = await createForm();

    form.form.setValue({
      user_id: 1,
      role_id: 1,
    });

    fixture.componentRef.setInput('resetKey', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      user_id: 0,
      role_id: 0,
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
      user_id: 1,
      role_id: 1,
    });

    form.submit();

    expect(emitted).toBe(false);
  });

  it('should prevent submission when no active users are available', async () => {
    const { fixture, form } = await createForm();

    form.users.set([]);
    form.form.setValue({
      user_id: 1,
      role_id: 1,
    });

    let emitted = false;
    form.saved.subscribe(() => {
      emitted = true;
    });

    form.submit();

    expect(emitted).toBe(false);
  });

  it('should expose an error when catalog loading fails', async () => {
    userApi = {
      list: vi.fn().mockReturnValue(
        throwError(() => new Error('Network error')),
      ),
    };
    roleApi = { list: vi.fn().mockReturnValue(of(ROLES)) };

    await TestBed.configureTestingModule({
      imports: [RoleUserForm],
      providers: [
        { provide: UserApi, useValue: userApi },
        { provide: RoleApi, useValue: roleApi },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RoleUserForm);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.catalogLoading()).toBe(false);
    expect(fixture.componentInstance.catalogError()).toBeTruthy();
    expect(fixture.componentInstance.users()).toEqual([]);
  });
});
