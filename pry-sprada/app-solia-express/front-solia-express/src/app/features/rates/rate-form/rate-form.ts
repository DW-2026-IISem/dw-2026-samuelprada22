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
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import {
  Rate,
  RatePayload,
} from '../../../core/models/rate.model';
import { toNumber } from '../../../core/models/api.model';

@Component({
  host: { class: 'block' },
  selector: 'app-rate-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './rate-form.html',
})
export class RateForm {
  readonly rate = input<Rate | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<RatePayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly typeOptions = [
    { label: 'Mensual', value: 'monthly' },
    { label: 'Anual', value: 'annual' },
  ];

  readonly form = this.fb.group({
    name: ['', [
      Validators.required,
      Validators.maxLength(120),
    ]],
    percentage: [0, [
      Validators.required,
      Validators.min(0),
      Validators.max(999.99),
    ]],
    type: ['monthly' as 'monthly' | 'annual', [
      Validators.required,
    ]],
    description: ['', [
      Validators.maxLength(255),
    ]],
  });

  constructor() {
    effect(() => {
      const current = this.rate();
      this.resetKey();

      this.form.reset({
        name: current?.name ?? '',
        percentage: current
          ? toNumber(current.percentage)
          : 0,
        type: current?.type ?? 'monthly',
        description: current?.description ?? '',
      });
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.saved.emit({
      name: value.name.trim(),
      percentage: value.percentage,
      type: value.type,
      description: value.description.trim() || null,
    });
  }
}
