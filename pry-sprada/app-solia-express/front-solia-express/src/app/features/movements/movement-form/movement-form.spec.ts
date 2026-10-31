import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { Account } from '../../../core/models/account.model';
import { Movement } from '../../../core/models/movement.model';
import { AccountApi } from '../../accounts/account-api';
import { MovementForm } from './movement-form';

const ACCOUNTS: Account[] = [
  {
    id: 10,
    member_id: 1,
    name: 'Ahorros',
    description: 'Cuenta principal',
    status: 'active',
  },
  {
    id: 20,
    member_id: 2,
    name: 'Cuenta inactiva',
    description: null,
    status: 'inactive',
  },
];

const MOVEMENT: Movement = {
  id: 1,
  account_id: 10,
  reference_id: 25,
  type: 'credit',
  date: '2026-10-30',
  amount: 150000,
  observations: 'Aporte de prueba',
  status: 'active',
};

describe('MovementForm', () => {
  let accountApi: { list: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    accountApi = {
      list: vi.fn(() => of(ACCOUNTS)),
    };

    await TestBed.configureTestingModule({
      imports: [MovementForm],
      providers: [
        {
          provide: AccountApi,
          useValue: accountApi,
        },
      ],
    }).compileComponents();
  });

  async function crearFormulario() {
    const fixture: ComponentFixture<MovementForm> =
      TestBed.createComponent(MovementForm);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return {
      fixture,
      form: fixture.componentInstance,
    };
  }

  it('should initialize with default values and load active accounts', async () => {
    const { form } = await crearFormulario();

    expect(form.form.getRawValue()).toEqual({
      account_id: 0,
      reference_id: 0,
      type: 'credit',
      date: expect.any(String),
      amount: 0,
      observations: '',
    });

    expect(form.accounts()).toEqual([ACCOUNTS[0]]);
    expect(form.accountsLoading()).toBe(false);
    expect(form.accountsError()).toBe(false);
    expect(accountApi.list).toHaveBeenCalledOnce();
  });

  it('should reject an invalid account selection', async () => {
    const { form } = await crearFormulario();
    let emitted = false;

    form.saved.subscribe(() => {
      emitted = true;
    });

    form.form.controls.account_id.setValue(0);
    form.submit();

    expect(form.form.controls.account_id.invalid).toBe(true);
    expect(form.form.controls.account_id.touched).toBe(true);
    expect(emitted).toBe(false);
  });

  it('should reject an amount equal to zero', async () => {
    const { form } = await crearFormulario();

    form.form.controls.amount.setValue(0);
    form.submit();

    expect(form.form.controls.amount.invalid).toBe(true);
    expect(form.form.controls.amount.hasError('min')).toBe(true);
  });

  it('should reject a negative amount', async () => {
    const { form } = await crearFormulario();

    form.form.controls.amount.setValue(-100);
    form.submit();

    expect(form.form.controls.amount.invalid).toBe(true);
  });

  it('should reject an empty date', async () => {
    const { form } = await crearFormulario();

    form.form.controls.date.setValue('');
    form.submit();

    expect(form.form.controls.date.invalid).toBe(true);
  });

  it('should emit a normalized payload when creating a movement', async () => {
    const { form } = await crearFormulario();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      account_id: 10,
      reference_id: 0,
      type: 'credit',
      date: '2026-10-30',
      amount: 150000,
      observations: '  Aporte de prueba  ',
    });
form.submit();

    expect(payload).toEqual({
      account_id: 10,
      reference_id: null,
      type: 'credit',
      date: '2026-10-30',
      amount: 150000,
      observations: 'Aporte de prueba',
    });
  });

  it('should emit debit movements correctly', async () => {
    const { form } = await crearFormulario();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      account_id: 10,
      reference_id: 25,
      type: 'debit',
      date: '2026-10-30',
      amount: 50000,
      observations: '',
    });

    form.submit();

    expect(payload).toEqual({
      account_id: 10,
      reference_id: 25,
      type: 'debit',
      date: '2026-10-30',
      amount: 50000,
      observations: null,
    });
  });

  it('should initialize edit mode with the movement data', async () => {
    const { fixture, form } = await crearFormulario();

    fixture.componentRef.setInput('movement', MOVEMENT);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      account_id: MOVEMENT.account_id,
      reference_id: MOVEMENT.reference_id,
      type: MOVEMENT.type,
      date: MOVEMENT.date,
      amount: Number(MOVEMENT.amount),
      observations: MOVEMENT.observations,
    });
  });

  it('should not include status in the emitted update payload', async () => {
    const { fixture, form } = await crearFormulario();
    let payload: unknown;

    fixture.componentRef.setInput('movement', MOVEMENT);
    fixture.detectChanges();
    await fixture.whenStable();

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.controls.observations.setValue('Movimiento actualizado');
    form.submit();

    expect(payload).toEqual({
      account_id: 10,
      reference_id: 25,
      type: 'credit',
      date: '2026-10-30',
      amount: 150000,
      observations: 'Movimiento actualizado',
    });

    expect(payload).not.toHaveProperty('status');
  });

  it('should reset the form when resetKey changes', async () => {
    const { fixture, form } = await crearFormulario();

    form.form.controls.account_id.setValue(10);
    form.form.controls.amount.setValue(50000);

    fixture.componentRef.setInput('resetKey', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      account_id: 0,
      reference_id: 0,
      type: 'credit',
      date: expect.any(String),
      amount: 0,
      observations: '',
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

  it('should show an error when accounts cannot be loaded', async () => {
    accountApi.list.mockReturnValue(
      throwError(() => new Error('Authentication required')),
    );

    const { fixture, form } = await crearFormulario();

    fixture.detectChanges();

    expect(form.accounts()).toEqual([]);
    expect(form.accountsError()).toBe(true);
    expect(form.accountsLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain(
      'No se pudieron cargar las cuentas',
    );
  });
});
