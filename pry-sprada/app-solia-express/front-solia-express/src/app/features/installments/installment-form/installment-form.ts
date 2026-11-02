import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';

import { Installment, InstallmentPayload } from '../../../core/models/installment.model';
import { Credit } from '../../../core/models/credit.model';
import { toNumber } from '../../../core/models/api.model';

import { CreditApi } from '../../credits/credit-api';

interface SelectOption {
  label: string;
  value: number;
}

@Component({
  host: { class: 'block' },
  selector: 'app-installment-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MessageModule,
    ButtonModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
  ],
  templateUrl: './installment-form.html',
  styleUrl: './installment-form.css',
})
export class InstallmentForm {
  readonly installment = input<Installment | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<InstallmentPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly creditApi = inject(CreditApi);

  private readonly creditRecords = signal<Credit[]>([]);

  readonly credits = computed<SelectOption[]>(() => {
    const current = this.installment();

    return this.creditRecords()
      .filter(
        (credit) =>
          credit.status === 'active' ||
          credit.id === current?.credit_id,
      )
      .map((credit) => ({
        label: this.creditLabel(credit),
        value: credit.id,
      }));
  });

  readonly creditsLoading = signal(false);
  readonly creditsError = signal(false);

  readonly form = this.fb.group({
    credit_id: [0, [Validators.required, Validators.min(1)]],
    number: [1, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^[1-9]\d*$/),
    ]],
    due_date: [new Date(), [Validators.required]],
    principal_amount: [0, [Validators.required, Validators.min(0)]],
    interest_amount: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    this.loadCredits();

    effect(() => {
      const current = this.installment();
      this.resetKey();

      this.form.reset(
        {
          credit_id: current?.credit_id ?? 0,
          number: current?.number ?? 1,
          due_date: current?.due_date
            ? new Date(`${current.due_date.slice(0, 10)}T00:00:00`)
            : new Date(),
          principal_amount: current
            ? toNumber(current.principal_amount)
            : 0,
          interest_amount: current
            ? toNumber(current.interest_amount)
            : 0,
        },
        { emitEvent: false },
      );

      if (current && toNumber(current.paid_amount) > 0) {
        this.form.controls.principal_amount.disable();
        this.form.controls.interest_amount.disable();
      } else {
        this.form.controls.principal_amount.enable();
        this.form.controls.interest_amount.enable();
      }
    });
  }

  private loadCredits(): void {
    this.creditsLoading.set(true);
    this.creditsError.set(false);

    this.creditApi.list().subscribe({
      next: (credits) => {
        this.creditRecords.set(credits);
        this.creditsLoading.set(false);
      },
      error: () => {
        this.creditRecords.set([]);
        this.creditsError.set(true);
        this.creditsLoading.set(false);
      },
    });
  }

  private creditLabel(credit: Credit): string {
    return `Crédito #${credit.id} — $${toNumber(
      credit.approved_amount,
    ).toLocaleString('es-CO')} (${credit.term} meses)`;
  }

  get totalAmount(): number {
    return (
      Number(this.form.controls.principal_amount.value || 0) +
      Number(this.form.controls.interest_amount.value || 0)
    );
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const total = value.principal_amount + value.interest_amount;

    if (total <= 0) {
      this.form.controls.principal_amount.markAsTouched();
      this.form.controls.interest_amount.markAsTouched();
      return;
    }

    this.saved.emit({
      credit_id: value.credit_id,
      number: value.number,
      due_date: this.formatDate(value.due_date),
      principal_amount: value.principal_amount,
      interest_amount: value.interest_amount,
      total_amount: total,
    });
  }
}
