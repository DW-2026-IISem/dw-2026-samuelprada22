import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CreditApplication,
  CreditApplicationPayload,
} from '../../../core/models/credit-application.model';
import { Member } from '../../../core/models/member.model';
import { MemberApi } from '../../members/member-api';
import { CreditApplicationForm } from './credit-application-form';

const MEMBERS: Member[] = [
  {
    id: 10,
    name: 'Ana',
    description: 'Socio activo',
    isActive: true,
  },
  {
    id: 20,
    name: 'Samuel',
    description: 'Socio inactivo',
    isActive: false,
  },
];

const CREDIT_APPLICATION: CreditApplication = {
  id: 1,
  member_id: 10,
  reference_id: null,
  date: '2026-11-01T10:00:00.000Z',
  amount: 5000000,
  status: 'pending',
  observations: 'Solicitud de crédito personal',
};

describe('CreditApplicationForm', () => {
  let memberApi: { list: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    memberApi = {
      list: vi.fn(() => of(MEMBERS)),
    };

    await TestBed.configureTestingModule({
      imports: [CreditApplicationForm],
      providers: [
        {
          provide: MemberApi,
          useValue: memberApi,
        },
      ],
    }).compileComponents();
  });

  async function createForm() {
    const fixture: ComponentFixture<CreditApplicationForm> =
      TestBed.createComponent(CreditApplicationForm);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return {
      fixture,
      form: fixture.componentInstance,
    };
  }

  it('should initialize with default values and load active members', async () => {
    const { form } = await createForm();

    const value = form.form.getRawValue();

    expect(value.member_id).toBe(0);
    expect(value.reference_id).toBeNull();
    expect(value.date).toBeInstanceOf(Date);
    expect(value.amount).toBe(0);
    expect(value.observations).toBe('');

    expect(form.members()).toEqual([MEMBERS[0]]);
    expect(form.membersLoading()).toBe(false);
    expect(form.membersError()).toBe(false);
    expect(memberApi.list).toHaveBeenCalledOnce();
  });

  it('should reject an invalid member selection', async () => {
    const { form } = await createForm();
    let emitted = false;

    form.saved.subscribe(() => {
      emitted = true;
    });

    form.form.controls.member_id.setValue(0);
    form.form.controls.amount.setValue(500000);
    form.submit();

    expect(form.form.controls.member_id.invalid).toBe(true);
    expect(form.form.controls.member_id.touched).toBe(true);
    expect(emitted).toBe(false);
  });

  it('should reject an amount equal to zero', async () => {
    const { form } = await createForm();

    form.form.controls.member_id.setValue(10);
    form.form.controls.amount.setValue(0);
    form.submit();

    expect(form.form.controls.amount.invalid).toBe(true);
    expect(form.form.controls.amount.touched).toBe(true);
  });

  it('should reject a negative amount', async () => {
    const { form } = await createForm();

    form.form.controls.member_id.setValue(10);
    form.form.controls.amount.setValue(-100);
    form.submit();

    expect(form.form.controls.amount.invalid).toBe(true);
  });

  it('should emit a normalized payload when creating an application', async () => {
    const { form } = await createForm();
    let payload: CreditApplicationPayload | undefined;

    const date = new Date('2026-11-01T10:00:00.000Z');

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      member_id: 10,
      reference_id: 25,
      date,
      amount: 5000000,
      observations: '  Solicitud de crédito personal  ',
    });

    form.submit();

    expect(payload).toEqual({
      member_id: 10,
      reference_id: 25,
      date: date.toISOString(),
      amount: 5000000,
      observations: 'Solicitud de crédito personal',
    });
  });

  it('should convert empty observations into null', async () => {
    const { form } = await createForm();
    let payload: CreditApplicationPayload | undefined;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.controls.member_id.setValue(10);
    form.form.controls.amount.setValue(1000000);
    form.form.controls.observations.setValue('   ');

    form.submit();

    expect(payload?.observations).toBeNull();
  });

  it('should initialize edit mode with the application data', async () => {
    const { fixture, form } = await createForm();

    fixture.componentRef.setInput('application', CREDIT_APPLICATION);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      member_id: CREDIT_APPLICATION.member_id,
      reference_id: CREDIT_APPLICATION.reference_id,
      date: new Date(CREDIT_APPLICATION.date),
      amount: Number(CREDIT_APPLICATION.amount),
      observations: CREDIT_APPLICATION.observations,
    });
  });

  it('should not include status in the emitted update payload', async () => {
    const { fixture, form } = await createForm();
    let payload: CreditApplicationPayload | undefined;

    fixture.componentRef.setInput('application', CREDIT_APPLICATION);
    fixture.detectChanges();
    await fixture.whenStable();

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.controls.observations.setValue('Observaciones actualizadas');
    form.submit();

    expect(payload).toEqual({
      member_id: 10,
      reference_id: null,
      date: CREDIT_APPLICATION.date,
      amount: 5000000,
      observations: 'Observaciones actualizadas',
    });

    expect(payload).not.toHaveProperty('status');
  });

  it('should reset the form when resetKey changes', async () => {
    const { fixture, form } = await createForm();

    form.form.controls.member_id.setValue(10);
    form.form.controls.amount.setValue(2000000);
    form.form.controls.observations.setValue('Valor anterior');

    fixture.componentRef.setInput('resetKey', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    const value = form.form.getRawValue();

    expect(value.member_id).toBe(0);
    expect(value.reference_id).toBeNull();
    expect(value.amount).toBe(0);
    expect(value.observations).toBe('');
    expect(value.date).toBeInstanceOf(Date);
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

  it('should show an error when members cannot be loaded', async () => {
    memberApi.list.mockReturnValue(
      throwError(() => new Error('Authentication required')),
    );

    const { fixture, form } = await createForm();

    fixture.detectChanges();

    expect(form.members()).toEqual([]);
    expect(form.membersError()).toBe(true);
    expect(form.membersLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain(
      'No fue posible cargar los socios',
    );
  });
});
