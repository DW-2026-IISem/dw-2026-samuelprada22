import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';

import {
  InstallmentPayment,
  InstallmentPaymentPayload,
  PaymentMethod,
} from '../../../core/models/installment-payment.model';
import { Installment } from '../../../core/models/installment.model';
import { toNumber } from '../../../core/models/api.model';
import { InstallmentApi } from '../../installments/installment-api';

interface SelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-installment-payment-form',
  host: { class: 'block' },
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    SelectModule,
  ],
  templateUrl: './installment-payment-form.html',
})
export class InstallmentPaymentForm {
  readonly payment = input<InstallmentPayment | null>(null);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<InstallmentPaymentPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly installmentApi = inject(InstallmentApi);

  private readonly installmentRecords = signal<Installment[]>([]);

  readonly installments = computed<SelectOption<number>[]>(() =>
    this.installmentRecords().map((installment) => ({
      label:
        `Cuota #${installment.number} — Crédito #${installment.credit_id} — ` +
        this.formatAmount(installment.total_amount),
      value: installment.id,
    })),
  );

  readonly installmentsLoading = signal(false);
  readonly installmentsError = signal(false);

  readonly methods: SelectOption<PaymentMethod>[] = [
    { label: 'Efectivo', value: 'cash' },
    { label: 'Transferencia', value: 'transfer' },
    { label: 'Consignación', value: 'deposit' },
    { label: 'Otro', value: 'other' },
  ];

  readonly form = this.fb.group({
    installment_id: [0, [Validators.required, Validators.min(1)]],
    payment_date: [new Date(), [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    reference: [''],
    method: ['cash' as PaymentMethod, [Validators.required]],
  });

  readonly editing = computed(() => this.payment() !== null);

  constructor() {
    this.loadInstallments();

    effect(() => {
      const current = this.payment();
      this.resetKey();

      this.form.reset(
        {
          installment_id: current?.installment_id ?? 0,
          payment_date: current?.payment_date
            ? new Date(`${current.payment_date.slice(0, 10)}T00:00:00`)
            : new Date(),
          amount: current ? toNumber(current.amount) : 0,
          reference: current?.reference ?? '',
          method: current?.method ?? 'cash',
        },
        { emitEvent: false },
      );

      if (current) {
        this.form.controls.installment_id.disable();
        this.form.controls.amount.disable();
      } else {
        this.form.controls.installment_id.enable();
        this.form.controls.amount.enable();
      }
    });
  }

  private loadInstallments(): void {
    this.installmentsLoading.set(true);
    this.installmentsError.set(false);

    this.installmentApi.list().subscribe({
      next: (installments) => {
        this.installmentRecords.set(
          installments.filter((item) => item.status === 'pending'),
        );
        this.installmentsLoading.set(false);
      },
      error: () => {
        this.installmentRecords.set([]);
        this.installmentsError.set(true);
        this.installmentsLoading.set(false);
      },
    });
  }

  private formatAmount(amount: number | string): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 2,
    }).format(toNumber(amount));
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

    if (!Number.isFinite(value.amount) || value.amount <= 0) {
      this.form.controls.amount.markAsTouched();
      return;
    }

    this.saved.emit({
      installment_id: value.installment_id,
      payment_date: this.formatDate(value.payment_date),
      amount: value.amount,
      reference: value.reference.trim() || null,
      method: value.method,
    });
  }
}
