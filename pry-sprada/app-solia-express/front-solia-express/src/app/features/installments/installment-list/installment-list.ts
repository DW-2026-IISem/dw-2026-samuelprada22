import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import {
  Installment,
  InstallmentPayload,
  InstallmentStatus,
} from '../../../core/models/installment.model';
import { Credit } from '../../../core/models/credit.model';
import { toNumber } from '../../../core/models/api.model';

import { NotificationService } from '../../../core/services/notification';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';

import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

import { InstallmentApi } from '../installment-api';
import { CreditApi } from '../../credits/credit-api';
import { InstallmentForm } from '../installment-form/installment-form';

@Component({
  host: { class: 'block' },
  selector: 'app-installment-list',
  imports: [
    ButtonModule,
    DatePipe,
    DialogModule,
    EmptyState,
    InputTextModule,
    MessageModule,
    PageHeader,
    RouterLink,
    TableModule,
    TagModule,
    TooltipModule,
    InstallmentForm,
  ],
  templateUrl: './installment-list.html',
  styleUrl: './installment-list.css',
})
export class InstallmentList {
  private readonly api = inject(InstallmentApi);
  private readonly creditApi = inject(CreditApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<Installment[]>([]);
  readonly credits = signal<Credit[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly creditsError = signal(false);

  readonly filter = signal('');

  readonly dialogVisible = signal(false);
  readonly editing = signal<Installment | null>(null);
  readonly resetKey = signal(0);

  readonly title = computed(() =>
    this.editing() ? 'Editar cuota' : 'Nueva cuota',
  );

  readonly creditFor = computed(() => {
    const map = new Map(
      this.credits().map((credit) => [credit.id, credit]),
    );

    return (id: number) => map.get(id);
  });

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (installment) => {
      const credit = this.creditFor()(installment.credit_id);

      return [
        installment.id,
        installment.credit_id,
        installment.number,
        installment.due_date,
        installment.principal_amount,
        installment.interest_amount,
        installment.total_amount,
        installment.paid_amount,
        installment.status,
        this.statusLabel(installment.status),
        credit?.approved_amount,
        credit?.term,
      ];
    }),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.creditsError.set(false);

    this.api.list().subscribe({
      next: (installments) => {
        this.rows.set(installments);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });

    this.creditApi.list().subscribe({
      next: (credits) => this.credits.set(credits),
      error: () => {
        this.credits.set([]);
        this.creditsError.set(true);
      },
    });
  }

  statusLabel(status: InstallmentStatus): string {
    const labels: Record<InstallmentStatus, string> = {
      pending: 'Pendiente',
      paid: 'Pagada',
      overdue: 'Vencida',
      cancelled: 'Cancelada',
    };

    return labels[status];
  }

  statusSeverity(
    status: InstallmentStatus,
  ): 'success' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<
      InstallmentStatus,
      'success' | 'warn' | 'danger' | 'secondary'
    > = {
      pending: 'warn',
      paid: 'success',
      overdue: 'danger',
      cancelled: 'secondary',
    };

    return severities[status];
  }

  formatAmount(amount: number | string): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 2,
    }).format(toNumber(amount));
  }

  openCreate(): void {
    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(installment: Installment): void {
    this.editing.set(installment);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: InstallmentPayload): void {
    const current = this.editing();
    this.saving.set(true);

    const editablePayload = {
      credit_id: payload.credit_id,
      number: payload.number,
      due_date: payload.due_date,
      principal_amount: payload.principal_amount,
      interest_amount: payload.interest_amount,
      total_amount: payload.total_amount,
    };

    const request = current
      ? this.api.update(current.id, editablePayload)
      : this.api.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);

        this.notify.success(
          current ? 'Cuota actualizada' : 'Cuota registrada',
        );

        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error(
          'No se pudo guardar la cuota',
          toApiMessage(error),
        );
      },
    });
  }

  cancelInstallment(installment: Installment): void {
    if (installment.status === 'cancelled') {
      return;
    }

    if (toNumber(installment.paid_amount) > 0) {
      this.notify.error(
        'No se puede cancelar la cuota',
        'La cuota tiene abonos registrados.',
      );
      return;
    }

    this.confirmation.confirm({
      header: 'Cancelar cuota',
      message:
        `¿Deseas cancelar la cuota #${installment.number} ` +
        `del crédito #${installment.credit_id}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cancelar cuota',
      rejectLabel: 'Volver',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deactivate(installment.id).subscribe({
          next: () => {
            this.notify.success('Cuota cancelada');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo cancelar la cuota',
              toApiMessage(error),
            );
          },
        });
      },
    });
  }
}
