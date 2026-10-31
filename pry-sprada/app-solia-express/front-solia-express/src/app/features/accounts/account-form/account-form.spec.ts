import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { Account } from '../../../core/models/account.model';
import { Member } from '../../../core/models/member.model';
import { MemberApi } from '../../members/member-api';
import { AccountForm } from './account-form';

const MEMBERS: Member[] = [
  {
    id: 10,
    name: 'Ana',
    description: 'Socio de prueba',
    isActive: true,
  },
  {
    id: 20,
    name: 'Samuel',
    description: null,
    isActive: true,
  },
];

const ACCOUNT: Account = {
  id: 1,
  member_id: 10,
  name: 'Ahorros',
  description: 'Cuenta de prueba',
  status: 'active',
};

describe('AccountForm', () => {
  let memberApi: { list: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    memberApi = {
      list: vi.fn(() => of(MEMBERS)),
    };

    await TestBed.configureTestingModule({
      imports: [AccountForm],
      providers: [
        {
          provide: MemberApi,
          useValue: memberApi,
        },
      ],
    }).compileComponents();
  });

  async function crearFormulario() {
    const fixture: ComponentFixture<AccountForm> =
      TestBed.createComponent(AccountForm);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return {
      fixture,
      form: fixture.componentInstance,
    };
  }

  it('should initialize with empty fields and load members', async () => {
    const { form } = await crearFormulario();

    expect(form.form.getRawValue()).toEqual({
      member_id: 0,
      name: '',
      description: '',
    });
    expect(form.members()).toEqual(MEMBERS);
    expect(form.membersLoading()).toBe(false);
    expect(form.membersError()).toBe(false);
    expect(memberApi.list).toHaveBeenCalledOnce();
  });

  it('should reject an invalid member selection', async () => {
    const { form } = await crearFormulario();
    let emitted = false;

    form.saved.subscribe(() => {
      emitted = true;
    });

    form.form.controls.member_id.setValue(0);
    form.form.controls.name.setValue('Ahorros');
    form.submit();

    expect(form.form.controls.member_id.invalid).toBe(true);
    expect(form.form.controls.member_id.touched).toBe(true);
    expect(emitted).toBe(false);
  });

  it('should reject an empty required name', async () => {
    const { form } = await crearFormulario();

    form.form.controls.member_id.setValue(10);
    form.form.controls.name.setValue('');
    form.submit();

    expect(form.form.controls.name.invalid).toBe(true);
    expect(form.form.controls.name.touched).toBe(true);
  });

  it('should reject names longer than 120 characters', async () => {
    const { form } = await crearFormulario();

    form.form.controls.member_id.setValue(10);
    form.form.controls.name.setValue('A'.repeat(121));
    form.submit();

    expect(form.form.controls.name.hasError('maxlength')).toBe(true);
  });

  it('should emit a normalized payload when creating an account', async () => {
    const { form } = await crearFormulario();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      member_id: 10,
      name: '  Ahorros voluntarios  ',
      description: '  ',
    });

    form.submit();

    expect(payload).toEqual({
      member_id: 10,
      name: 'Ahorros voluntarios',
      description: null,
    });
  });

  it('should initialize edit mode with the account data', async () => {
    const { fixture, form } = await crearFormulario();

    fixture.componentRef.setInput('account', ACCOUNT);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      member_id: ACCOUNT.member_id,
      name: ACCOUNT.name,
      description: ACCOUNT.description,
    });
  });

  it('should not include status in the emitted update payload', async () => {
    const { fixture, form } = await crearFormulario();
    let payload: unknown;

    fixture.componentRef.setInput('account', ACCOUNT);
    fixture.detectChanges();
    await fixture.whenStable();

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.controls.name.setValue('Ahorros actualizados');
    form.submit();

    expect(payload).toEqual({
      member_id: 10,
      name: 'Ahorros actualizados',
      description: 'Cuenta de prueba',
    });
    expect(payload).not.toHaveProperty('status');
  });

  it('should reset the form when resetKey changes', async () => {
    const { fixture, form } = await crearFormulario();

    form.form.controls.member_id.setValue(10);
    form.form.controls.name.setValue('Valor anterior');

    fixture.componentRef.setInput('resetKey', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      member_id: 0,
      name: '',
      description: '',
    });
  });

  it('should emit cancelled when the cancel action is requested', async () => {
    const { form } = await crearFormulario();
    let cancelled = false;

    form.cancelled.subscribe(() => {
      cancelled = true;
    });

    form.cancelled.emit();

    expect(cancelled).toBe(true);
  });

  it('should show an error when members cannot be loaded', async () => {
    memberApi.list.mockReturnValue(
      throwError(() => new Error('Authentication required')),
    );

    const { fixture, form } = await crearFormulario();

    fixture.detectChanges();

    expect(form.members()).toEqual([]);
    expect(form.membersError()).toBe(true);
    expect(form.membersLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain(
      'No se pudieron cargar los socios',
    );
  });
});
