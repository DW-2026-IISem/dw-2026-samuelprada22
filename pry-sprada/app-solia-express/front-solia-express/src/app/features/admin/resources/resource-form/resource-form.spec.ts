import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { Resource } from '../../../../core/models/resource.model';
import { ResourceForm } from './resource-form';

const RESOURCE: Resource = {
  id: 1,
  method: 'PATCH',
  path: '/api/usuarios/:id',
  description: 'Actualizar parcialmente un usuario',
  status: 'active',
};

describe('ResourceForm', () => {
  async function createForm() {
    await TestBed.configureTestingModule({
      imports: [ResourceForm],
    }).compileComponents();

    const fixture: ComponentFixture<ResourceForm> =
      TestBed.createComponent(ResourceForm);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, form: fixture.componentInstance };
  }

  it('should initialize with default values in creation mode', async () => {
    const { form } = await createForm();

    expect(form.form.getRawValue()).toEqual({
      method: 'GET',
      path: '',
      description: '',
      status: 'active',
    });

    expect(form.form.controls.path.hasValidator(Validators.required)).toBe(true);
  });

  it('should reject an empty path', async () => {
    const { form } = await createForm();
    let emitted = false;

    form.saved.subscribe(() => {
      emitted = true;
    });

    form.form.controls.path.setValue('');
    form.submit();

    expect(form.form.controls.path.invalid).toBe(true);
    expect(form.form.controls.path.touched).toBe(true);
    expect(emitted).toBe(false);
  });

  it('should reject paths and descriptions outside the allowed length', async () => {
    const { form } = await createForm();

    form.form.controls.path.setValue('/'.repeat(256));
    expect(form.form.controls.path.hasError('maxlength')).toBe(true);

    form.form.controls.description.setValue('D'.repeat(256));
    expect(form.form.controls.description.hasError('maxlength')).toBe(true);
  });

  it('should emit a normalized payload when creating a resource', async () => {
    const { form } = await createForm();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      method: 'POST',
      path: '  /api/usuarios  ',
      description: '  Crear un usuario  ',
      status: 'active',
    });

    form.submit();

    expect(payload).toEqual({
      method: 'POST',
      path: '/api/usuarios',
      description: 'Crear un usuario',
      status: 'active',
    });
  });

  it('should allow creating a resource with inactive initial status', async () => {
    const { form } = await createForm();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      method: 'DELETE',
      path: '/api/usuarios/:id',
      description: '',
      status: 'inactive',
    });

    form.submit();

    expect(payload).toEqual({
      method: 'DELETE',
      path: '/api/usuarios/:id',
      description: null,
      status: 'inactive',
    });
  });

  it('should initialize edit mode with the selected resource', async () => {
    const { fixture, form } = await createForm();

    fixture.componentRef.setInput('resource', RESOURCE);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      method: RESOURCE.method,
      path: RESOURCE.path,
      description: RESOURCE.description,
      status: RESOURCE.status,
    });

    expect(form.form.controls.status.disabled).toBe(true);
  });

  it('should emit only editable fields when updating a resource', async () => {
    const { fixture, form } = await createForm();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    fixture.componentRef.setInput('resource', RESOURCE);
    fixture.detectChanges();
    await fixture.whenStable();

    form.form.controls.method.setValue('PUT');
    form.form.controls.path.setValue('  /api/usuarios/:id  ');
    form.form.controls.description.setValue('  Actualizar usuario  ');

    form.submit();

    expect(payload).toEqual({
      method: 'PUT',
      path: '/api/usuarios/:id',
      description: 'Actualizar usuario',
    });

    expect(payload).not.toHaveProperty('status');
  });

  it('should reset the form when resetKey changes', async () => {
    const { fixture, form } = await createForm();

    form.form.controls.path.setValue('/api/ruta-anterior');

    fixture.componentRef.setInput('resetKey', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      method: 'GET',
      path: '',
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
      method: 'GET',
      path: '/api/usuarios',
      description: '',
      status: 'active',
    });

    form.submit();

    expect(emitted).toBe(false);
  });
});
