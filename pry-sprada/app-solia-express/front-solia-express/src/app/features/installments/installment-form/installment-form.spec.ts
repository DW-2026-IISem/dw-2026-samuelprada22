import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  Installment,
  InstallmentPayload,
} from '../../../core/models/installment.model';
import { Credit } from '../../../core/models/credit.model';

import { CreditApi } from '../../credits/credit-api';
import { InstallmentForm } from './installment-form';

const CREDITS: Credit[] = [
  {
    id: 100,
    credit_application_id: 20,
    rate_id: 5,
    date: '2026-10-01',
    approved_amount: 5000000,
    term: 12,
    interest_rate: 2.5,
    status: 'active',
    observations: 'Crédito activo',
  },
  {
    id: 200,
    credit_application_id: 30,
    rate_id: 5,
    date: '2026-10-01',
    approved_amount: 3000000,
    term: 18,
    interest_rate: 2.5,
    status: 'cancelled',
    observations: 'Crédito inactivo',
  },
];

const INSTALLMENT: Installment = {
  id: 10,
  credit_id: 100,
  number: 3,
  due_date: '2026-12-15',
  principal_amount: 400000,
  interest_amount: 50000,
  total_amount: 450000,
  paid_amount: 0,
  status: 'pending',
};

const PAID_INSTALLMENT: Installment = {
  ...INSTALLMENT,
  paid_amount: 100000,
};

describe('InstallmentForm', () => {
  let creditApi: {
    list: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    creditApi = {
      list: vi.fn(() => of(CREDITS)),
    };

    await TestBed.configureTestingModule({
      imports: [InstallmentForm],
      providers: [
        {
          provide: CreditApi,
          useValue: creditApi,
        },
      ],
    }).compileComponents();
  });

  async function createForm() {
    const fixture: ComponentFixture<InstallmentForm> =
      TestBed.createComponent(InstallmentForm);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return {
      fixture,
      form: fixture.componentInstance,
    };
  }

  it('should initialize with default values and load active credits', async () => {
    const { form } = await createForm();

    expect(form.form.getRawValue()).toEqual({
      credit_id: 0,
      number: 1,
      due_date: expect.any(Date),
      principal_amount: 0,
      interest_amount: 0,
    });

    expect(form.credits().map((credit) => credit.value)).toEqual([100]);
    expect(form.creditsLoading()).toBe(false);
    expect(form.creditsError()).toBe(false);
    expect(creditApi.list).toHaveBeenCalledOnce();
  });

  it('should exclude inactive credits from the available options', async () => {
    const { form } = await createForm();

    const availableIds = form.credits().map((credit) => credit.value);

    expect(availableIds).toContain(100);
    expect(availableIds).not.toContain(200);
  });

  it('should initialize edit mode with the installment data', async () => {
    const { fixture, form } = await createForm();

    fixture.componentRef.setInput('installment', INSTALLMENT);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      credit_id: INSTALLMENT.credit_id,
      number: INSTALLMENT.number,
      due_date: new Date(2026, 11, 15),
      principal_amount: 400000,
      interest_amount: 50000,
    });
  });

  it('should retain a cancelled associated credit when editing an installment', async () => {
    const { fixture, form } = await createForm();

    expect(form.credits().map((credit) => credit.value)).toEqual([100]);

    const installmentWithCancelledCredit: Installment = {
      ...INSTALLMENT,
      credit_id: 200,
    };

    fixture.componentRef.setInput(
      'installment',
      installmentWithCancelledCredit,
    );
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.controls.credit_id.value).toBe(200);
    expect(form.credits().map((credit) => credit.value)).toEqual([100, 200]);
  });

  it('should reset the form when resetKey changes', async () => {
    const { fixture, form } = await createForm();

    form.form.controls.number.setValue(8);
    form.form.controls.principal_amount.setValue(900000);

    fixture.componentRef.setInput('resetKey', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      credit_id: 0,
      number: 1,
      due_date: expect.any(Date),
      principal_amount: 0,
      interest_amount: 0,
    });
  });

  it('should calculate the total from principal and interest', async () => {
    const { form } = await createForm();

    form.form.controls.principal_amount.setValue(400000);
    form.form.controls.interest_amount.setValue(50000);

    expect(form.totalAmount).toBe(450000);
  });

  it('should reject an invalid credit selection', async () => {
    const { form } = await createForm();

    form.form.controls.credit_id.setValue(0);
    form.submit();

    expect(form.form.controls.credit_id.invalid).toBe(true);
    expect(form.form.controls.credit_id.touched).toBe(true);
  });

  it('should reject a zero installment number', async () => {
    const { form } = await createForm();

    form.form.controls.number.setValue(0);
    form.submit();

    expect(form.form.controls.number.invalid).toBe(true);
  });

  it('should reject a fractional installment number', async () => {
    const { form } = await createForm();

    form.form.controls.number.setValue(2.5);
    form.submit();

    expect(form.form.controls.number.hasError('pattern')).toBe(true);
  });

  it('should reject a negative principal amount', async () => {
    const { form } = await createForm();

    form.form.controls.principal_amount.setValue(-100);
    form.submit();

    expect(form.form.controls.principal_amount.invalid).toBe(true);
  });

  it('should reject a negative interest amount', async () => {
    const { form } = await createForm();

    form.form.controls.interest_amount.setValue(-100);
    form.submit();

    expect(form.form.controls.interest_amount.invalid).toBe(true);
  });

  it('should reject a total equal to zero', async () => {
    const { form } = await createForm();

    form.form.setValue({
      credit_id: 100,
      number: 1,
      due_date: new Date(2026, 11, 15),
      principal_amount: 0,
      interest_amount: 0,
    });

    form.submit();

    expect(form.form.controls.principal_amount.touched).toBe(true);
    expect(form.form.controls.interest_amount.touched).toBe(true);
  });

  it('should emit a normalized payload when creating an installment', async () => {
    const { form } = await createForm();
    let payload: InstallmentPayload | undefined;

    const dueDate = new Date(2026, 11, 15);

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      credit_id: 100,
      number: 3,
      due_date: dueDate,
      principal_amount: 400000,
      interest_amount: 50000,
    });

    form.submit();

    expect(payload).toEqual({
      credit_id: 100,
      number: 3,
      due_date: '2026-12-15',
      principal_amount: 400000,
      interest_amount: 50000,
      total_amount: 450000,
    });

    expect(payload).not.toHaveProperty('paid_amount');
    expect(payload).not.toHaveProperty('status');
  });

  it('should disable financial amount fields when the installment has payments', async () => {
    const { fixture, form } = await createForm();

    fixture.componentRef.setInput('installment', PAID_INSTALLMENT);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.controls.principal_amount.disabled).toBe(true);
    expect(form.form.controls.interest_amount.disabled).toBe(true);
    expect(form.form.controls.credit_id.enabled).toBe(true);
    expect(form.form.controls.number.enabled).toBe(true);
    expect(form.form.controls.due_date.enabled).toBe(true);
  });

  it('should emit an update payload without changing paid amount or status', async () => {
    const { fixture, form } = await createForm();
    let payload: InstallmentPayload | undefined;

    fixture.componentRef.setInput('installment', INSTALLMENT);
    fixture.detectChanges();
    await fixture.whenStable();

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.controls.principal_amount.setValue(500000);
    form.submit();

    expect(payload).toEqual({
      credit_id: 100,
      number: 3,
      due_date: '2026-12-15',
      principal_amount: 500000,
      interest_amount: 50000,
      total_amount: 550000,
    });

    expect(payload).not.toHaveProperty('paid_amount');
    expect(payload).not.toHaveProperty('status');
  });

  it('should show an error when credits cannot be loaded', async () => {
    creditApi.list.mockReturnValue(
      throwError(() => new Error('Authentication required')),
    );

    const { fixture, form } = await createForm();

    expect(form.credits()).toEqual([]);
    expect(form.creditsError()).toBe(true);
    expect(form.creditsLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain(
      'No fue posible cargar los créditos.',
    );
  });

  it('should emit cancelled when the cancel action is requested', async () => {
    const { form } = await createForm();
    let cancelled = false;

    form.cancelled.subscribe(() => {
      cancelled = true;
    });

    form.cancelled.emit();

    expect(cancelled).toBe(true);
  });
});
