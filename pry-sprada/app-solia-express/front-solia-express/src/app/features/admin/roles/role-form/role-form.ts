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
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import {
  Role,
  RolePayload,
  UpdateRolePayload,
} from '../../../../core/models/role.model';

@Component({
  host: { class: 'block' },
  selector: 'app-role-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './role-form.html',
})
export class RoleForm {
  readonly role = input<Role | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<RolePayload | UpdateRolePayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly statusOptions = [
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
  ];

  readonly form = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.maxLength(80),
    ]],
    description: ['', [
      Validators.maxLength(255),
    ]],
    status: ['active'],
  });

  constructor() {
    effect(() => {
      const current = this.role();

      this.resetKey();

      this.form.reset({
        name: current?.name ?? '',
        description: current?.description ?? '',
        status: current?.status ?? 'active',
      });

      if (current) {
        this.form.controls.status.disable();
      } else {
        this.form.controls.status.enable();
      }
    });
  }

  submit(): void {
    if (this.saving()) {
      return;
    }

    this.form.controls.name.setValue(
      this.form.controls.name.value.trim(),
    );
    this.form.controls.description.setValue(
      this.form.controls.description.value.trim(),
    );

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const profile = {
      name: value.name.toUpperCase(),
      description: value.description || null,
    };

    if (this.role()) {
      this.saved.emit(profile);
      return;
    }

    this.saved.emit({
      ...profile,
      status: value.status as 'active' | 'inactive',
    });
  }
}
