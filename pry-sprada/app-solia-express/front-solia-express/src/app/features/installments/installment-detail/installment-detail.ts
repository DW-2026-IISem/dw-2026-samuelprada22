import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';

import {
  Installment,
  InstallmentStatus,
} from '../../../core/models/installment.model';
import { Credit } from '../../../core/models/credit.model';
import { toNumber } from '../../../core/models/api.model';

import { toApiMessage } from '../../../core/utils/api-error';

import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

import { InstallmentApi } from '../installment-api';
import { CreditApi } from '../../credits/credit-api';

@Component({
  selector: 'app-installment-detail',
  host: { class: 'block' },
  imports: [
    ButtonModule,
    DatePipe,
    EmptyState,
    MessageModule,
    PageHeader,
    RouterLink,
    TagModule,
  ],
  templateUrl: './installment-detail.html',
  styleUrl: './installment-detail.css',
})
export class InstallmentDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly installmentApi = inject(InstallmentApi);
  private readonly creditApi = inject(CreditApi);

  readonly installment = signal<Installment | null>(null);
  readonly credit = signal<Credit | null>(null);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly relatedDataWarning = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.loading.set(true);
    this.error.set(null);
    this.relatedDataWarning.set(false);

    if (!Number.isInteger(id) || id < 1) {
      this.installment.set(null);
      this.credit.set(null);
      this.error.set('El identificador de la cuota no es válido.');
      this.loading.set(false);
      return;
    }

    this.installmentApi.get(id).pipe(
      switchMap((installment) =>
        this.creditApi.get(installment.credit_id).pipe(
          map((credit) => ({ installment, credit })),
          catchError(() => of({ installment, credit: null })),
        ),
      ),
    ).subscribe({
      next: ({ installment, credit }) => {
        this.installment.set(installment);
        this.credit.set(credit);
        this.relatedDataWarning.set(!credit);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.installment.set(null);
        this.credit.set(null);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
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

  get balance(): number {
    const installment = this.installment();

    if (!installment) {
      return 0;
    }

    return Math.max(
      0,
      toNumber(installment.total_amount) -
        toNumber(installment.paid_amount),
    );
  }
}
