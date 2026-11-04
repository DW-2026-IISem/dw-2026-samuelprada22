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
  HttpMethod,
  Resource,
  ResourcePayload,
  UpdateResourcePayload,
} from '../../../../core/models/resource.model';

@Component({
  host: { class: 'block' },
  selector: 'app-resource-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './resource-form.html',
})
export class ResourceForm {
  readonly resource = input<Resource | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<ResourcePayload | UpdateResourcePayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly methodOptions: { label: string; value: HttpMethod }[] = [
    { label: 'GET · Consultar', value: 'GET' },
    { label: 'POST · Crear', value: 'POST' },
    { label: 'PUT · Reemplazar', value: 'PUT' },
    { label: 'PATCH · Actualizar parcialmente', value: 'PATCH' },
    { label: 'DELETE · Eliminar', value: 'DELETE' },
  ];

  readonly statusOptions = [
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
  ];

  readonly form = this.fb.group({
    method: this.fb.control<HttpMethod>('GET', [
      Validators.required,
    ]),
    path: ['', [
      Validators.required,
      Validators.maxLength(255),
    ]],
    description: ['', [
      Validators.maxLength(255),
    ]],
    status: ['active'],
  });

  constructor() {
    effect(() => {
      const current = this.resource();

      this.resetKey();

      this.form.reset({
        method: current?.method ?? 'GET',
        path: current?.path ?? '',
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

    this.form.controls.path.setValue(
      this.form.controls.path.value.trim(),
    );
    this.form.controls.description.setValue(
      this.form.controls.description.value.trim(),
    );

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const resourceData = {
      method: value.method,
      path: value.path,
      description: value.description || null,
    };

    if (this.resource()) {
      this.saved.emit(resourceData);
      return;
    }

    this.saved.emit({
      ...resourceData,
      status: value.status as 'active' | 'inactive',
    });
  }
}
