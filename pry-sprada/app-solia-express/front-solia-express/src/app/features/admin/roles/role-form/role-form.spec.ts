import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { Role } from '../../../../core/models/role.model';
import { RoleForm } from './role-form';

const ROLE: Role = {
  id: 1,
  name: 'CAJERO',
  description: 'Gestiona movimientos y pagos',
  status: 'active',
};

describe('RoleForm', () => {
  async function createForm() {
    await TestBed.configureTestingModule({
      imports: [RoleForm],
    }).compileComponents();

    const fixture: ComponentFixture<RoleForm> =
      TestBed.createComponent(RoleForm);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, form: fixture.componentInstance };
  }

  it('should initialize with empty fields in creation mode', async () => {
    const { form } = await createForm();

    expect(form.form.getRawValue()).toEqual({
      name: '',
      description: '',
      status: 'active',
    });

    expect(
      form.form.controls.name.hasValidator(Validators.required),
    ).toBe(true);
  });

  it('should reject an empty role name', async () => {
    const { form } = await createForm();
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

  it('should reject names and descriptions outside the allowed length', async () => {
    const { form } = await createForm();

    form.form.controls.name.setValue('R'.repeat(81));
    expect(form.form.controls.name.hasError('maxlength')).toBe(true);

    form.form.controls.description.setValue('D'.repeat(256));
    expect(form.form.controls.description.hasError('maxlength')).toBe(true);
  });

  it('should emit a normalized payload when creating a role', async () => {
    const { form } = await createForm();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      name: '  analista_credito  ',
      description: '  Analiza solicitudes de crédito  ',
      status: 'active',
    });

    form.submit();

    expect(payload).toEqual({
      name: 'ANALISTA_CREDITO',
      description: 'Analiza solicitudes de crédito',
      status: 'active',
    });
  });

  it('should allow creating a role with inactive initial status', async () => {
    const { form } = await createForm();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      name: 'AUDITOR',
      description: '',
      status: 'inactive',
    });

    form.submit();

    expect(payload).toEqual({
      name: 'AUDITOR',
      description: null,
      status: 'inactive',
    });
  });

  it('should initialize edit mode with the selected role', async () => {
    const { fixture, form } = await createForm();

    fixture.componentRef.setInput('role', ROLE);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      name: ROLE.name,
      description: ROLE.description,
      status: ROLE.status,
    });

    expect(form.form.controls.status.disabled).toBe(true);
  });

  it('should emit only editable fields when updating a role', async () => {
    const { fixture, form } = await createForm();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    fixture.componentRef.setInput('role', ROLE);
    fixture.detectChanges();
    await fixture.whenStable();

    form.form.controls.name.setValue('  analista_actualizado  ');
    form.form.controls.description.setValue('  Nueva descripción  ');

    form.submit();

    expect(payload).toEqual({
      name: 'ANALISTA_ACTUALIZADO',
      description: 'Nueva descripción',
    });

    expect(payload).not.toHaveProperty('status');
  });

  it('should reset the form when resetKey changes', async () => {
    const { fixture, form } = await createForm();

    form.form.controls.name.setValue('ROL_ANTERIOR');
    form.form.controls.description.setValue('Descripción anterior');

    fixture.componentRef.setInput('resetKey', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      name: '',
      description: '',
      status: 'active',
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
      name: 'COMITE',
      description: 'Evalúa solicitudes',
      status: 'active',
    });

    form.submit();

    expect(emitted).toBe(false);
  });
});
