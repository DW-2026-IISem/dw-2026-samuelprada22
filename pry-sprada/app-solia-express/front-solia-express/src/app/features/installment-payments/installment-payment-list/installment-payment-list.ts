import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import {
  InstallmentPayment,
  InstallmentPaymentPayload,
  InstallmentPaymentStatus,
  PaymentMethod,
} from '../../../core/models/installment-payment.model';

import { toNumber } from '../../../core/models/api.model';
import { NotificationService } from '../../../core/services/notification';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';

import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

import { InstallmentPaymentApi } from '../installment-payment-api';
import { InstallmentPaymentForm } from '../installment-payment-form/installment-payment-form';

@Component({
  selector: 'app-installment-payment-list',
  host: { class: 'block' },
  imports: [
    ButtonModule,
    DatePipe,
    DialogModule,
    EmptyState,
    InputTextModule,
    MessageModule,
    PageHeader,
    TableModule,
    TagModule,
    TooltipModule,
    InstallmentPaymentForm,
  ],
  templateUrl: './installment-payment-list.html',
})
export class InstallmentPaymentList {
  private readonly api = inject(InstallmentPaymentApi);
  private readonly notify = inject(NotificationService);

  readonly rows = signal<InstallmentPayment[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');

  readonly dialogVisible = signal(false);
  readonly editing = signal<InstallmentPayment | null>(null);
  readonly resetKey = signal(0);

  readonly title = computed(() =>
    this.editing() ? 'Editar pago' : 'Registrar pago',
  );

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (payment) => [
      payment.id,
      payment.installment_id,
      payment.payment_date,
      payment.amount,
      payment.reference,
      payment.method,
      this.methodLabel(payment.method),
      payment.status,
    ]),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.list().subscribe({
      next: (payments) => {
        this.rows.set(payments);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  formatAmount(amount: number | string): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 2,
    }).format(toNumber(amount));
  }

  methodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      cash: 'Efectivo',
      transfer: 'Transferencia',
      deposit: 'Consignación',
      other: 'Otro',
    };

    return labels[method];
  }

  statusLabel(status: InstallmentPaymentStatus): string {
    return status === 'active' ? 'Activo' : 'Cancelado';
  }

  statusSeverity(
    status: InstallmentPaymentStatus,
  ): 'success' | 'secondary' {
    return status === 'active' ? 'success' : 'secondary';
  }

  openCreate(): void {
    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(payment: InstallmentPayment): void {
    if (payment.status !== 'active') {
      return;
    }

    this.editing.set(payment);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: InstallmentPaymentPayload): void {
    const current = this.editing();
    this.saving.set(true);

    const request = current
      ? this.api.update(current.id, {
          payment_date: payload.payment_date,
          reference: payload.reference ?? null,
          method: payload.method,
        })
      : this.api.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);

        this.notify.success(
          current ? 'Pago actualizado' : 'Pago registrado',
        );

        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error(
          'No se pudo guardar el pago',
          toApiMessage(error),
        );
      },
    });
  }
}
