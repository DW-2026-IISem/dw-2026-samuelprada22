import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { User } from '../../../../core/models/user.model';
import { UserForm } from './user-form';

const USER: User = {
  id: 1,
  username: 'usuario.prueba',
  email: 'usuario@solia.test',
  avatar: 'https://solia.test/avatar.png',
  status: 'active',
};

describe('UserForm', () => {
  async function crearFormulario() {
    await TestBed.configureTestingModule({
      imports: [UserForm],
    }).compileComponents();

    const fixture: ComponentFixture<UserForm> =
      TestBed.createComponent(UserForm);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, form: fixture.componentInstance };
  }

  it('should initialize with empty fields in creation mode', async () => {
    const { form } = await crearFormulario();

    expect(form.form.getRawValue()).toEqual({
      username: '',
      email: '',
      password: '',
      avatar: '',
    });

    expect(form.form.controls.password.hasValidator(
      (await import('@angular/forms')).Validators.required,
    )).toBe(true);
  });

  it('should reject an empty username', async () => {
    const { form } = await crearFormulario();
    let emitted = false;

    form.saved.subscribe(() => {
      emitted = true;
    });

    form.form.controls.username.setValue('');
    form.submit();

    expect(form.form.controls.username.invalid).toBe(true);
    expect(form.form.controls.username.touched).toBe(true);
    expect(emitted).toBe(false);
  });

  it('should reject usernames outside the allowed length', async () => {
    const { form } = await crearFormulario();

    form.form.controls.username.setValue('ab');
    expect(form.form.controls.username.hasError('minlength')).toBe(true);

    form.form.controls.username.setValue('u'.repeat(81));
    expect(form.form.controls.username.hasError('maxlength')).toBe(true);
  });

  it('should reject invalid email addresses', async () => {
    const { form } = await crearFormulario();

    form.form.controls.email.setValue('correo-invalido');

    expect(form.form.controls.email.invalid).toBe(true);
    expect(form.form.controls.email.hasError('email')).toBe(true);
  });

  it('should emit a normalized payload when creating a user', async () => {
    const { form } = await crearFormulario();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    form.form.setValue({
      username: '  nuevo.usuario  ',
      email: '  NUEVO@SOLIA.TEST  ',
      password: 'ClaveInicial123',
      avatar: '  https://solia.test/nuevo.png  ',
    });

    form.submit();

    expect(payload).toEqual({
      username: 'nuevo.usuario',
      email: 'NUEVO@SOLIA.TEST',
      password: 'ClaveInicial123',
      avatar: 'https://solia.test/nuevo.png',
    });
  });

  it('should initialize edit mode without requiring a password', async () => {
    const { fixture, form } = await crearFormulario();

    fixture.componentRef.setInput('user', USER);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      username: USER.username,
      email: USER.email,
      password: '',
      avatar: USER.avatar,
    });

    expect(form.form.controls.password.valid).toBe(true);
    expect(form.form.controls.password.hasValidator(
      (await import('@angular/forms')).Validators.required,
    )).toBe(false);
  });

  it('should emit only profile fields when editing a user', async () => {
    const { fixture, form } = await crearFormulario();
    let payload: unknown;

    form.saved.subscribe((value) => {
      payload = value;
    });

    fixture.componentRef.setInput('user', USER);
    fixture.detectChanges();
    await fixture.whenStable();

    form.form.controls.username.setValue('  usuario.actualizado  ');
    form.form.controls.email.setValue('  actualizado@solia.test  ');
    form.form.controls.password.setValue('No debe enviarse');

    form.submit();

    expect(payload).toEqual({
      username: 'usuario.actualizado',
      email: 'actualizado@solia.test',
      avatar: 'https://solia.test/avatar.png',
    });

    expect(payload).not.toHaveProperty('password');
    expect(payload).not.toHaveProperty('status');
  });

  it('should reset the form when resetKey changes', async () => {
    const { fixture, form } = await crearFormulario();

    form.form.controls.username.setValue('valor.anterior');

    fixture.componentRef.setInput('resetKey', 1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(form.form.getRawValue()).toEqual({
      username: '',
      email: '',
      password: '',
      avatar: '',
    });
  });

  it('should not emit while saving', async () => {
    const { fixture, form } = await crearFormulario();
    let emitted = false;

    form.saved.subscribe(() => {
      emitted = true;
    });

    fixture.componentRef.setInput('saving', true);
    fixture.detectChanges();

    form.form.setValue({
      username: 'nuevo.usuario',
      email: 'nuevo@solia.test',
      password: 'Clave123',
      avatar: '',
    });

    form.submit();

    expect(emitted).toBe(false);
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
