import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  CommitteeDecision,
  CommitteeDecisionPayload,
} from '../../../core/models/committee-decision.model';
import { CreditApplication } from '../../../core/models/credit-application.model';
import { CommitteeDecisionForm } from './committee-decision-form';

const APPLICATION: CreditApplication = {
  id: 10,
  member_id: 1,
  reference_id: null,
  date: '2026-11-02',
  amount: 5000000,
  status: 'pending',
  observations: null,
};

const DECISION: CommitteeDecision = {
  id: 1,
  credit_application_id: 10,
  decision: 'approved',
  decision_date: '2026-11-02',
  comments: 'Aprobada por el comité',
  decided_by: 2,
  status: 'active',
};

describe('CommitteeDecisionForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommitteeDecisionForm],
    }).compileComponents();
  });

  async function createForm() {
    const fixture: ComponentFixture<CommitteeDecisionForm> =
      TestBed.createComponent(CommitteeDecisionForm);

    fixture.componentRef.setInput('applications', [APPLICATION]);
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
      credit_application_id: 0,
      decision: 'pending',
      decision_date: null,
      comments: '',
    });
  });

  it('should initialize edit mode with the decision data', async () => {
    const { fixture, form } = await createForm();

    fixture.componentRef.setInput('decision', DECISION);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      credit_application_id: 10,
      decision: 'approved',
      decision_date: new Date('2026-11-02'),
      comments: 'Aprobada por el comité',
    });
  });

  it('should reset the form when resetKey changes', async () => {
    const { fixture, form } = await createForm();

    form.form.controls.comments.setValue('Texto temporal');

    fixture.componentRef.setInput('resetKey', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      credit_application_id: 0,
      decision: 'pending',
      decision_date: null,
      comments: '',
    });
  });

  it('should reject an invalid credit application id', async () => {
    const { form } = await createForm();

    form.form.controls.credit_application_id.setValue(0);
    form.submit();

    expect(
      form.form.controls.credit_application_id.hasError('min'),
    ).toBe(true);
    expect(form.form.controls.credit_application_id.touched).toBe(true);
  });

  it('should reject comments longer than 2000 characters', async () => {
    const { form } = await createForm();

    form.form.controls.comments.setValue('A'.repeat(2001));
    form.submit();

    expect(form.form.controls.comments.hasError('maxlength')).toBe(true);
  });

  it('should emit a normalized payload without status or decided_by', async () => {
    const { form } = await createForm();
    let payload: CommitteeDecisionPayload | undefined;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      credit_application_id: 10,
      decision: 'approved',
      decision_date: null,
      comments: '  Aprobada por el comité  ',
    });

    form.submit();

    expect(payload).toEqual({
      credit_application_id: 10,
      decision: 'approved',
      decision_date: null,
      comments: 'Aprobada por el comité',
    });
    expect(payload).not.toHaveProperty('status');
    expect(payload).not.toHaveProperty('decided_by');
  });

  it('should serialize the decision date using local date components', async () => {
    const { form } = await createForm();
    let payload: CommitteeDecisionPayload | undefined;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      credit_application_id: 10,
      decision: 'approved',
      decision_date: new Date(2026, 10, 2),
      comments: '',
    });

    form.submit();

    expect(payload?.decision_date).toBe('2026-11-02');
  });

  it('should normalize empty comments to null', async () => {
    const { form } = await createForm();
    let payload: CommitteeDecisionPayload | undefined;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      credit_application_id: 10,
      decision: 'pending',
      decision_date: null,
      comments: '   ',
    });

    form.submit();

    expect(payload?.comments).toBeNull();
  });

  it('should not emit a payload while saving', async () => {
    const { fixture, form } = await createForm();
    let emitted = false;

    fixture.componentRef.setInput('saving', true);
    fixture.detectChanges();

    form.form.setValue({
      credit_application_id: 10,
      decision: 'approved',
      decision_date: null,
      comments: '',
    });

    form.saved.subscribe(() => {
      emitted = true;
    });

    form.submit();

    expect(emitted).toBe(false);
  });
});
