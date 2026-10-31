import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Member } from '../../../core/models/member.model';
import { MemberForm } from './member-form';

const MEMBER: Member = {
  id: 1,
  name: 'Socio de prueba',
  description: 'Descripción original',
  isActive: true,
};

describe('MemberForm', () => {
  async function crearFormulario() {
    await TestBed.configureTestingModule({
      imports: [MemberForm],
    }).compileComponents();

    const fixture: ComponentFixture<MemberForm> =
      TestBed.createComponent(MemberForm);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, form: fixture.componentInstance };
  }

  it('should initialize with empty fields and active status', async () => {
    const { form } = await crearFormulario();

    expect(form.form.getRawValue()).toEqual({
      name: '',
      description: '',
      isActive: true,
    });
  });

  it('should reject an empty required name', async () => {
    const { form } = await crearFormulario();
    let emitted = false;

    form.saved.subscribe(() => {
      emitted = true;
    });

    form.form.controls.name.setValue('');
    form.submit();

    expect(form.form.controls.name.invalid).toBe(true);
    expect(form.form.controls.name.touched).toBe(true);
    expect(emitted).toBe(false);
  });

  it('should reject names longer than 120 characters', async () => {
    const { form } = await crearFormulario();

    form.form.controls.name.setValue('A'.repeat(121));
    form.submit();

    expect(form.form.controls.name.hasError('maxlength')).toBe(true);
  });

  it('should emit a normalized payload when creating a member', async () => {
    const { form } = await crearFormulario();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      name: '  Nuevo socio  ',
      description: '  ',
      isActive: true,
    });

    form.submit();

    expect(payload).toEqual({
      name: 'Nuevo socio',
      description: null,
      isActive: true,
    });
  });

  it('should initialize edit mode and emit no active status', async () => {
    const { fixture, form } = await crearFormulario();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    fixture.componentRef.setInput('member', MEMBER);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      name: MEMBER.name,
      description: MEMBER.description,
      isActive: MEMBER.isActive,
    });
    expect(form.form.controls.isActive.disabled).toBe(true);

    form.form.controls.name.setValue('Socio actualizado');
    form.submit();

    expect(payload).toEqual({
      name: 'Socio actualizado',
      description: 'Descripción original',
    });
    expect(payload).not.toHaveProperty('isActive');
  });

  it('should reset the form when resetKey changes', async () => {
    const { fixture, form } = await crearFormulario();

    form.form.controls.name.setValue('Valor anterior');

    fixture.componentRef.setInput('resetKey', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      name: '',
      description: '',
      isActive: true,
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
});
