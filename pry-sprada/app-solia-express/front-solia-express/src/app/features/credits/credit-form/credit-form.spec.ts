import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Credit, CreditPayload } from '../../../core/models/credit.model';
import { CreditApplication } from '../../../core/models/credit-application.model';
import { Rate } from '../../../core/models/rate.model';

import { CreditApi } from '../credit-api';
import { CreditApplicationApi } from '../../credit-applications/credit-application-api';
import { RateApi } from '../../rates/rate-api';
import { CreditForm } from './credit-form';

const APPLICATIONS: CreditApplication[] = [
  {
    id: 1,
    member_id: 10,
    reference_id: null,
    date: '2026-11-01T10:00:00.000Z',
    amount: 5000000,
    status: 'approved',
    observations: null,
  },
  {
    id: 2,
    member_id: 20,
    reference_id: null,
    date: '2026-11-01T10:00:00.000Z',
    amount: 3000000,
    status: 'pending',
    observations: null,
  },
  {
    id: 3,
    member_id: 10,
    reference_id: null,
    date: '2026-11-01T10:00:00.000Z',
    amount: 8000000,
    status: 'approved',
    observations: null,
  },
];

const CREDIT: Credit = {
  id: 100,
  credit_application_id: 3,
  rate_id: 9,
  date: '2026-11-01T10:00:00.000Z',
  approved_amount: 7500000,
  term: 24,
  interest_rate: 3.5,
  status: 'active',
  observations: 'Crédito de prueba',
};

const CREDITS: Credit[] = [CREDIT];

const RATES: Rate[] = [
  {
    id: 5,
    name: 'Tasa mensual ordinaria',
    percentage: 2.5,
    type: 'monthly',
    description: 'Tasa activa de prueba',
    status: 'active',
  },
];

const INACTIVE_RATE: Rate = {
  id: 9,
  name: 'Tasa anterior',
  percentage: 3.5,
  type: 'monthly',
  description: 'Tasa inactiva',
  status: 'inactive',
};

describe('CreditForm', () => {
  let creditApi: {
    list: ReturnType<typeof vi.fn>;
  };

  let applicationApi: {
    list: ReturnType<typeof vi.fn>;
  };

  let rateApi: {
    list: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    creditApi = {
      list: vi.fn(() => of(CREDITS)),
    };

    applicationApi = {
      list: vi.fn(() => of(APPLICATIONS)),
    };

    rateApi = {
      list: vi.fn(() => of(RATES)),
      get: vi.fn(() => of(INACTIVE_RATE)),
    };

    await TestBed.configureTestingModule({
      imports: [CreditForm],
      providers: [
        { provide: CreditApi, useValue: creditApi },
        { provide: CreditApplicationApi, useValue: applicationApi },
        { provide: RateApi, useValue: rateApi },
      ],
    }).compileComponents();
  });

  async function createForm() {
    const fixture: ComponentFixture<CreditForm> =
      TestBed.createComponent(CreditForm);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return {
      fixture,
      form: fixture.componentInstance,
    };
  }

  it('should initialize with default values and load applications and rates', async () => {
    const { form } = await createForm();

    expect(form.form.getRawValue()).toEqual({
      credit_application_id: 0,
      rate_id: 0,
      date: expect.any(Date),
      approved_amount: 0,
      term: 1,
      interest_rate: 0,
      observations: '',
    });

    expect(form.applications()).toEqual([
      {
        label: expect.stringContaining('Solicitud #1'),
        value: 1,
      },
    ]);

    expect(form.rates()).toEqual(RATES);
    expect(form.applicationsLoading()).toBe(false);
    expect(form.ratesLoading()).toBe(false);
    expect(form.applicationsError()).toBe(false);
    expect(form.ratesError()).toBe(false);

    expect(applicationApi.list).toHaveBeenCalledOnce();
    expect(creditApi.list).toHaveBeenCalledOnce();
    expect(rateApi.list).toHaveBeenCalledOnce();
  });

  it('should exclude pending applications and applications with another credit', async () => {
    const { form } = await createForm();

    const availableIds = form.applications().map((option) => option.value);

    expect(availableIds).toEqual([1]);
    expect(availableIds).not.toContain(2);
    expect(availableIds).not.toContain(3);
  });

  it('should preserve the current application when editing a credit', async () => {
    const { fixture, form } = await createForm();

    fixture.componentRef.setInput('credit', CREDIT);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      form.applications().map((option) => option.value),
    ).toContain(CREDIT.credit_application_id);

    expect(form.form.controls.credit_application_id.value).toBe(3);
  });

  it('should load the current inactive rate when editing', async () => {
    const { fixture, form } = await createForm();

    fixture.componentRef.setInput('credit', CREDIT);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(rateApi.get).toHaveBeenCalledWith(CREDIT.rate_id);
    expect(form.rates()).toContainEqual(INACTIVE_RATE);
    expect(form.form.controls.rate_id.value).toBe(CREDIT.rate_id);
  });

  it('should initialize edit mode with the credit data', async () => {
    const { fixture, form } = await createForm();

    fixture.componentRef.setInput('credit', CREDIT);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      credit_application_id: CREDIT.credit_application_id,
      rate_id: CREDIT.rate_id,
      date: new Date(CREDIT.date),
      approved_amount: 7500000,
      term: 24,
      interest_rate: 3.5,
      observations: 'Crédito de prueba',
    });
  });

  it('should update interest rate when selecting a rate', async () => {
    const { form } = await createForm();

    form.form.controls.rate_id.setValue(5);

    expect(form.form.controls.interest_rate.value).toBe(2.5);
  });

  it('should reject an invalid application selection', async () => {
    const { form } = await createForm();

    form.form.controls.credit_application_id.setValue(0);
    form.submit();

    expect(form.form.controls.credit_application_id.invalid).toBe(true);
    expect(form.form.controls.credit_application_id.touched).toBe(true);
  });

  it('should reject an approved amount equal to zero', async () => {
    const { form } = await createForm();

    form.form.controls.approved_amount.setValue(0);
    form.submit();

    expect(form.form.controls.approved_amount.invalid).toBe(true);
  });

  it('should reject a negative approved amount', async () => {
    const { form } = await createForm();

    form.form.controls.approved_amount.setValue(-100);
    form.submit();

    expect(form.form.controls.approved_amount.invalid).toBe(true);
  });

  it('should reject a zero term', async () => {
    const { form } = await createForm();

    form.form.controls.term.setValue(0);
    form.submit();

    expect(form.form.controls.term.invalid).toBe(true);
  });

  it('should reject a fractional term', async () => {
    const { form } = await createForm();

    form.form.controls.term.setValue(12.5);
    form.submit();

    expect(form.form.controls.term.hasError('pattern')).toBe(true);
  });

  it('should emit a normalized payload when creating a credit', async () => {
    const { form } = await createForm();
    let payload: CreditPayload | undefined;

    const date = new Date('2026-11-01T10:00:00.000Z');

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      credit_application_id: 1,
      rate_id: 5,
      date,
      approved_amount: 4500000,
      term: 18,
      interest_rate: 2.5,
      observations: '  Crédito de prueba  ',
    });

    form.submit();

    expect(payload).toEqual({
      credit_application_id: 1,
      rate_id: 5,
      date: date.toISOString(),
      approved_amount: 4500000,
      term: 18,
      interest_rate: 2.5,
      observations: 'Crédito de prueba',
    });
  });

  it('should convert empty observations into null', async () => {
    const { form } = await createForm();
    let payload: CreditPayload | undefined;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      credit_application_id: 1,
      rate_id: 5,
      date: new Date('2026-11-01T10:00:00.000Z'),
      approved_amount: 4500000,
      term: 18,
      interest_rate: 2.5,
      observations: '   ',
    });

    form.submit();

    expect(payload?.observations).toBeNull();
  });

  it('should reset the form when resetKey changes', async () => {
    const { fixture, form } = await createForm();

    form.form.controls.approved_amount.setValue(2000000);
    form.form.controls.observations.setValue('Valor anterior');

    fixture.componentRef.setInput('resetKey', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    const value = form.form.getRawValue();

    expect(value.credit_application_id).toBe(0);
    expect(value.rate_id).toBe(0);
    expect(value.approved_amount).toBe(0);
    expect(value.term).toBe(1);
    expect(value.interest_rate).toBe(0);
    expect(value.observations).toBe('');
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

  it('should show an error when applications cannot be loaded', async () => {
    applicationApi.list.mockReturnValue(
      throwError(() => new Error('Authentication required')),
    );

    const { fixture, form } = await createForm();

    fixture.detectChanges();

    expect(form.applications()).toEqual([]);
    expect(form.applicationsError()).toBe(true);
    expect(form.applicationsLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain(
      'No fue posible cargar las solicitudes de crédito',
    );
  });

  it('should show an error when rates cannot be loaded', async () => {
    rateApi.list.mockReturnValue(
      throwError(() => new Error('Authentication required')),
    );

    const { fixture, form } = await createForm();

    fixture.detectChanges();

    expect(form.rates()).toEqual([]);
    expect(form.ratesError()).toBe(true);
    expect(form.ratesLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain(
      'No fue posible cargar las tasas de interés',
    );
  });
});
