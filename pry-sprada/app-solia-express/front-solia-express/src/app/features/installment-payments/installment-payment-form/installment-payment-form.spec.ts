import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../../environments/environment';
import { InstallmentPayment } from '../../../core/models/installment-payment.model';
import { Installment } from '../../../core/models/installment.model';
import { InstallmentPaymentForm } from './installment-payment-form';

const BASE = `${environment.apiUrl}/installments`;

const INSTALLMENTS: Installment[] = [
  {
    id: 10,
    credit_id: 100,
    number: 1,
    due_date: '2026-12-01',
    principal_amount: 350000,
    interest_amount: 15000,
    total_amount: 365000,
    paid_amount: 0,
    status: 'pending',
  },
  {
    id: 11,
    credit_id: 100,
    number: 2,
    due_date: '2027-01-01',
    principal_amount: 350000,
    interest_amount: 15000,
    total_amount: 365000,
    paid_amount: 0,
    status: 'paid',
  },
];

const PAYMENT: InstallmentPayment = {
  id: 1,
  installment_id: 10,
  payment_date: '2026-11-01',
  amount: 150000,
  reference: 'TRF-001',
  method: 'transfer',
  status: 'active',
};

describe('InstallmentPaymentForm', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallmentPaymentForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function createForm(payment?: InstallmentPayment) {
    const fixture: ComponentFixture<InstallmentPaymentForm> =
      TestBed.createComponent(InstallmentPaymentForm);

    if (payment) {
      fixture.componentRef.setInput('payment', payment);
    }

    fixture.detectChanges();

    http.expectOne(BASE).flush({
      installments: INSTALLMENTS,
    });

    await fixture.whenStable();
    fixture.detectChanges();

    return {
      fixture,
      form: fixture.componentInstance,
    };
  }

  it('should initialize with default values and load pending installments', async () => {
    const { form } = await createForm();

    expect(form.form.getRawValue()).toEqual({
      installment_id: 0,
      payment_date: expect.any(Date),
      amount: 0,
      reference: '',
      method: 'cash',
    });

    expect(form.installments().map((item) => item.value)).toEqual([10]);
    expect(form.installmentsLoading()).toBe(false);
    expect(form.installmentsError()).toBe(false);
    expect(form.editing()).toBe(false);
  });

  it('should initialize edit mode with the payment data', async () => {
    const { form } = await createForm(PAYMENT);

    expect(form.form.getRawValue()).toEqual({
      installment_id: 10,
      payment_date: new Date(2026, 10, 1),
      amount: 150000,
      reference: 'TRF-001',
      method: 'transfer',
    });

    expect(form.editing()).toBe(true);
  });

  it('should disable installment and amount fields when editing', async () => {
    const { form } = await createForm(PAYMENT);

    expect(form.form.controls.installment_id.disabled).toBe(true);
    expect(form.form.controls.amount.disabled).toBe(true);
    expect(form.form.controls.payment_date.enabled).toBe(true);
    expect(form.form.controls.reference.enabled).toBe(true);
    expect(form.form.controls.method.enabled).toBe(true);
  });

  it('should reset the form when resetKey changes', async () => {
    const { fixture, form } = await createForm();

    form.form.controls.amount.setValue(250000);
    form.form.controls.reference.setValue('TEMP-001');

    fixture.componentRef.setInput('resetKey', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      installment_id: 0,
      payment_date: expect.any(Date),
      amount: 0,
      reference: '',
      method: 'cash',
    });
  });

  it('should reject an invalid installment selection', async () => {
    const { form } = await createForm();

    form.form.controls.installment_id.setValue(0);
    form.submit();

    expect(form.form.controls.installment_id.invalid).toBe(true);
    expect(form.form.controls.installment_id.touched).toBe(true);
  });

  it('should reject a zero payment amount', async () => {
    const { form } = await createForm();

    form.form.controls.installment_id.setValue(10);
    form.form.controls.amount.setValue(0);
    form.submit();

    expect(form.form.controls.amount.invalid).toBe(true);
  });

  it('should reject a negative payment amount', async () => {
    const { form } = await createForm();

    form.form.controls.amount.setValue(-100);
    form.submit();

    expect(form.form.controls.amount.invalid).toBe(true);
  });

  it('should emit a normalized payload when registering a payment', async () => {
    const { form } = await createForm();
    let payload: any;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      installment_id: 10,
      payment_date: new Date(2026, 10, 1),
      amount: 150000,
      reference: '  TRF-001  ',
      method: 'transfer',
    });

    form.submit();

    expect(payload).toEqual({
      installment_id: 10,
      payment_date: '2026-11-01',
      amount: 150000,
      reference: 'TRF-001',
      method: 'transfer',
    });

    expect(payload).not.toHaveProperty('status');
  });

  it('should emit null when the payment reference is empty', async () => {
    const { form } = await createForm();
    let payload: any;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      installment_id: 10,
      payment_date: new Date(2026, 10, 1),
      amount: 150000,
      reference: '   ',
      method: 'cash',
    });

    form.submit();

    expect(payload.reference).toBeNull();
  });

  it('should preserve the original installment and amount when editing', async () => {
    const { form } = await createForm(PAYMENT);
    let payload: any;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.controls.payment_date.setValue(new Date(2026, 10, 2));
    form.form.controls.reference.setValue('UPDATED-001');
    form.form.controls.method.setValue('deposit');

    form.submit();

    expect(payload).toEqual({
      installment_id: 10,
      payment_date: '2026-11-02',
      amount: 150000,
      reference: 'UPDATED-001',
      method: 'deposit',
    });
  });

  it('should show an error when installments cannot be loaded', async () => {
    const fixture = TestBed.createComponent(InstallmentPaymentForm);

    fixture.detectChanges();

    http.expectOne(BASE).flush(
      { message: 'Server error' },
      { status: 500, statusText: 'Server Error' },
    );

    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.installments()).toEqual([]);
    expect(fixture.componentInstance.installmentsError()).toBe(true);
    expect(fixture.componentInstance.installmentsLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain(
      'No fue posible cargar las cuotas pendientes.',
    );
  });
});
