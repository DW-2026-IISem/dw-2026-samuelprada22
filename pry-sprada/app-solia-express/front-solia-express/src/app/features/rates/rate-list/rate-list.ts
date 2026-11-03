import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import {
  Rate,
  RatePayload,
  UpdateRatePayload,
} from '../../../core/models/rate.model';
import { toNumber } from '../../../core/models/api.model';

import { NotificationService } from '../../../core/services/notification';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';

import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';

import { RateApi } from '../rate-api';
import { RateForm } from '../rate-form/rate-form';

@Component({
  host: { class: 'block' },
  selector: 'app-rate-list',
  imports: [
    ButtonModule,
    DialogModule,
    EmptyState,
    InputTextModule,
    MessageModule,
    PageHeader,
    RateForm,
    StatusTag,
    TableModule,
    TooltipModule,
  ],
  templateUrl: './rate-list.html',
})
export class RateList {
  private readonly api = inject(RateApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<Rate[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly filter = signal('');

  readonly dialogVisible = signal(false);
  readonly editing = signal<Rate | null>(null);
  readonly resetKey = signal(0);

  readonly title = computed(() =>
    this.editing() ? 'Editar tasa' : 'Nueva tasa',
  );

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (rate) => [
      rate.id,
      rate.name,
      rate.percentage,
      rate.type,
      this.typeLabel(rate.type),
      rate.description,
      rate.status,
    ]),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.list().subscribe({
      next: (rates) => {
        this.rows.set(rates);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  typeLabel(type: Rate['type']): string {
    return type === 'monthly' ? 'Mensual' : 'Anual';
  }

  formatPercentage(value: number | string): string {
    return `${new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(toNumber(value))}%`;
  }

  openCreate(): void {
    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(rate: Rate): void {
    this.editing.set(rate);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: RatePayload): void {
    const current = this.editing();
    this.saving.set(true);

    const editablePayload: UpdateRatePayload = {
      name: payload.name,
      percentage: payload.percentage,
      type: payload.type,
      description: payload.description,
    };

    const request = current
      ? this.api.update(current.id, editablePayload)
      : this.api.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);

        this.notify.success(
          current ? 'Tasa actualizada' : 'Tasa registrada',
        );

        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error(
          'No se pudo guardar la tasa',
          toApiMessage(error),
        );
      },
    });
  }

  deactivate(rate: Rate): void {
    if (rate.status !== 'active') {
      return;
    }

    this.confirmation.confirm({
      header: 'Desactivar tasa',
      message: `¿Deseas desactivar la tasa "${rate.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Volver',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deactivate(rate.id).subscribe({
          next: () => {
            this.notify.success('Tasa desactivada');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo desactivar la tasa',
              toApiMessage(error),
            );
          },
        });
      },
    });
  }
}
