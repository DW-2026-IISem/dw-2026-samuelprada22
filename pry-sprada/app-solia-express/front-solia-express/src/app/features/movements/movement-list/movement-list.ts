import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { catchError, forkJoin, of } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';

import { Account } from '../../../core/models/account.model';
import {
  Movement,
  MovementPayload,
} from '../../../core/models/movement.model';
import { NotificationService } from '../../../core/services/notification';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';

import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';

import { AccountApi } from '../../accounts/account-api';
import { MovementApi } from '../movement-api';
import { MovementForm } from '../movement-form/movement-form';

@Component({
  host: { class: 'block' },
  selector: 'app-movement-list',
  imports: [
    ButtonModule,
    DatePipe,
    DialogModule,
    EmptyState,
    HasPermissionDirective,
    InputTextModule,
    MessageModule,
    MovementForm,
    PageHeader,
    StatusTag,
    TableModule,
  ],
  templateUrl: './movement-list.html',
  styleUrl: './movement-list.css',
})
export class MovementList {
  private readonly api = inject(MovementApi);
  private readonly accountApi = inject(AccountApi);
  private readonly notify = inject(NotificationService);

  readonly rows = signal<Movement[]>([]);
  readonly accounts = signal<Account[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly accountsError = signal(false);
  readonly filter = signal('');

  readonly dialogVisible = signal(false);
  readonly editing = signal<Movement | null>(null);
  readonly resetKey = signal(0);

  readonly title = computed(() =>
    this.editing() ? 'Editar movimiento' : 'Nuevo movimiento',
  );

  readonly accountName = computed(() => {
    const map = new Map(
      this.accounts().map((account) => [account.id, account.name]),
    );

    return (id: number) => map.get(id) ?? `Cuenta #${id}`;
  });

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (movement) => [
      movement.id,
      movement.account_id,
      this.accountName()(movement.account_id),
      movement.reference_id,
      movement.type,
      movement.date,
      movement.amount,
      movement.observations,
      movement.status,
    ]),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.accountsError.set(false);

    forkJoin({
      movements: this.api.list(),
      accounts: this.accountApi.list().pipe(
        catchError(() => {
          this.accountsError.set(true);
          return of([] as Account[]);
        }),
      ),
    }).subscribe({
      next: ({ movements, accounts }) => {
        this.rows.set(movements);
        this.accounts.set(accounts);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.accounts.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  movementType(type: string): string {
    const labels: Record<string, string> = {
      credit: 'Crédito',
      debit: 'Débito',
    };

    return labels[type.toLowerCase()] ?? type;
  }

  formatAmount(amount: number | string): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 2,
    }).format(Number(amount));
  }

  openCreate(): void {
    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(movement: Movement): void {
    this.editing.set(movement);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: MovementPayload): void {
    const current = this.editing();
    this.saving.set(true);

    const editablePayload = {
      account_id: payload.account_id,
      reference_id: payload.reference_id ?? null,
      type: payload.type,
      date: payload.date,
      amount: payload.amount,
      observations: payload.observations ?? null,
    };

    const request = current
      ? this.api.update(current.id, editablePayload)
      : this.api.create(editablePayload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);

        this.notify.success(
          current ? 'Movimiento actualizado' : 'Movimiento creado',
        );

        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error(
          'No se pudo guardar el movimiento',
          toApiMessage(error),
        );
      },
    });
  }
}
