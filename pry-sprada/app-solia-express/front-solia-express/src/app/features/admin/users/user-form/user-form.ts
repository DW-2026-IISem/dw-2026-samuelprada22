import {
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from '../../../../core/models/user.model';

@Component({
  host: { class: 'block' },
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
  ],
  templateUrl: './user-form.html',
})
export class UserForm {
  readonly user = input<User | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<CreateUserPayload | UpdateUserPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    username: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(80),
    ]],
    email: ['', [
      Validators.required,
      Validators.email,
      Validators.maxLength(150),
    ]],
    password: [''],
    avatar: [''],
  });

  constructor() {
    effect(() => {
      const current = this.user();

      this.resetKey();

      this.form.reset({
        username: current?.username ?? '',
        email: current?.email ?? '',
        password: '',
        avatar: current?.avatar ?? '',
      });

      if (current) {
        this.form.controls.password.clearValidators();
      } else {
        this.form.controls.password.setValidators([
          Validators.required,
        ]);
      }

      this.form.controls.password.updateValueAndValidity();
    });
  }

  submit(): void {
    if (this.saving()) {
      return;
    }

    // Normalizar antes de validar para admitir espacios accidentales.
    this.form.controls.username.setValue(
      this.form.controls.username.value.trim(),
    );
    this.form.controls.email.setValue(
      this.form.controls.email.value.trim(),
    );
    this.form.controls.avatar.setValue(
      this.form.controls.avatar.value.trim(),
    );

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const profile = {
      username: value.username,
      email: value.email,
      avatar: value.avatar || null,
    };

    if (this.user()) {
      this.saved.emit(profile);
      return;
    }

    this.saved.emit({
      ...profile,
      password: value.password,
    });
  }
}
