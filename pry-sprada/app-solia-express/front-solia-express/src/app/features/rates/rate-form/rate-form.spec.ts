import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { Rate, RatePayload } from '../../../core/models/rate.model';
import { RateForm } from './rate-form';

const RATE: Rate = {
  id: 1,
  name: 'Tasa mensual ordinaria',
  percentage: '2.50',
  type: 'monthly',
  description: 'Tasa para créditos ordinarios',
  status: 'active',
};

describe('RateForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateForm],
    }).compileComponents();
  });

  async function createForm() {
    const fixture: ComponentFixture<RateForm> =
      TestBed.createComponent(RateForm);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return {
      fixture,
      form: fixture.componentInstance,
    };
  }

  it('should initialize with default values', async () => {
    const { form } = await createForm();

    expect(form.form.getRawValue()).toEqual({
      name: '',
      percentage: 0,
      type: 'monthly',
      description: '',
    });
  });

  it('should initialize edit mode with the rate data', async () => {
    const { fixture, form } = await createForm();

    fixture.componentRef.setInput('rate', RATE);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      name: RATE.name,
      percentage: 2.5,
      type: RATE.type,
      description: RATE.description,
    });
  });

  it('should reset the form when resetKey changes', async () => {
    const { fixture, form } = await createForm();

    form.form.controls.name.setValue('Tasa temporal');
    form.form.controls.percentage.setValue(8);

    fixture.componentRef.setInput('resetKey', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      name: '',
      percentage: 0,
      type: 'monthly',
      description: '',
    });
  });

  it('should reject an empty rate name', async () => {
    const { form } = await createForm();

    form.form.controls.name.setValue('');
    form.submit();

    expect(form.form.controls.name.hasError('required')).toBe(true);
    expect(form.form.controls.name.touched).toBe(true);
  });

  it('should reject a percentage outside the allowed range', async () => {
    const { form } = await createForm();

    form.form.controls.percentage.setValue(1000);
    form.submit();

    expect(form.form.controls.percentage.hasError('max')).toBe(true);

    form.form.controls.percentage.setValue(-1);
    form.submit();

    expect(form.form.controls.percentage.hasError('min')).toBe(true);
  });

  it('should reject a name longer than 120 characters', async () => {
    const { form } = await createForm();

    form.form.controls.name.setValue('A'.repeat(121));
    form.submit();

    expect(form.form.controls.name.hasError('maxlength')).toBe(true);
  });

  it('should reject a description longer than 255 characters', async () => {
    const { form } = await createForm();

    form.form.controls.description.setValue('A'.repeat(256));
    form.submit();

    expect(form.form.controls.description.hasError('maxlength')).toBe(true);
  });

  it('should emit a normalized payload without status', async () => {
    const { form } = await createForm();
    let payload: RatePayload | undefined;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      name: '  Tasa mensual ordinaria  ',
      percentage: 2.5,
      type: 'monthly',
      description: '  Tasa para créditos ordinarios  ',
    });

    form.submit();

    expect(payload).toEqual({
      name: 'Tasa mensual ordinaria',
      percentage: 2.5,
      type: 'monthly',
      description: 'Tasa para créditos ordinarios',
    });

    expect(payload).not.toHaveProperty('status');
  });

  it('should normalize an empty description to null', async () => {
    const { form } = await createForm();
    let payload: RatePayload | undefined;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      name: 'Tasa anual',
      percentage: 12,
      type: 'annual',
      description: '   ',
    });

    form.submit();

    expect(payload?.description).toBeNull();
  });

  it('should not emit a payload while saving', async () => {
    const { fixture, form } = await createForm();
    let emitted = false;

    form.saved.subscribe(() => {
      emitted = true;
    });

    fixture.componentRef.setInput('saving', true);
    fixture.detectChanges();

    form.form.setValue({
      name: 'Tasa anual',
      percentage: 12,
      type: 'annual',
      description: '',
    });

    form.submit();

    expect(emitted).toBe(false);
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
