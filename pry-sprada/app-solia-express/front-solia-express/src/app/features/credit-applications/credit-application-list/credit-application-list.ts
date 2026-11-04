import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ConfirmationService } from 'primeng/api';
import { catchError, forkJoin, of } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import {
  CreditApplication,
  CreditApplicationPayload,
  CreditApplicationStatus,
} from '../../../core/models/credit-application.model';
import { Member } from '../../../core/models/member.model';
import { NotificationService } from '../../../core/services/notification';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';

import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

import { MemberApi } from '../../members/member-api';
import { CreditApplicationApi } from '../credit-application-api';
import { CreditApplicationForm } from '../credit-application-form/credit-application-form';

@Component({
  host: { class: 'block' },
  selector: 'app-credit-application-list',
  imports: [
    ButtonModule,
    DatePipe,
    DialogModule,
    EmptyState,
    HasPermissionDirective,
    InputTextModule,
    MessageModule,
    PageHeader,
    TableModule,
    TagModule,
    TooltipModule,
    CreditApplicationForm,
  ],
  templateUrl: './credit-application-list.html',
  styleUrl: './credit-application-list.css',
})
export class CreditApplicationList {
  private readonly api = inject(CreditApplicationApi);
  private readonly memberApi = inject(MemberApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<CreditApplication[]>([]);
  readonly members = signal<Member[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly membersError = signal(false);
  readonly filter = signal('');

  readonly dialogVisible = signal(false);
  readonly editing = signal<CreditApplication | null>(null);
  readonly resetKey = signal(0);

  readonly title = computed(() =>
    this.editing()
      ? 'Editar solicitud de crédito'
      : 'Nueva solicitud de crédito',
  );

  readonly memberName = computed(() => {
    const map = new Map(
      this.members().map((member) => [member.id, member.name]),
    );

    return (id: number) => map.get(id) ?? `Socio #${id}`;
  });

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (application) => [
      application.id,
      application.member_id,
      this.memberName()(application.member_id),
      application.reference_id,
      application.date,
      application.amount,
      application.observations,
      application.status,
      this.statusLabel(application.status),
    ]),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.membersError.set(false);

    forkJoin({
      applications: this.api.list(),
      members: this.memberApi.list().pipe(
        catchError(() => {
          this.membersError.set(true);
          return of([] as Member[]);
        }),
      ),
    }).subscribe({
      next: ({ applications, members }) => {
        this.rows.set(applications);
        this.members.set(members);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.members.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  statusLabel(status: CreditApplicationStatus): string {
    const labels: Record<CreditApplicationStatus, string> = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
      cancelled: 'Cancelada',
    };

    return labels[status];
  }

  statusSeverity(
    status: CreditApplicationStatus,
  ): 'info' | 'success' | 'danger' | 'secondary' {
    const severities: Record<
      CreditApplicationStatus,
      'info' | 'success' | 'danger' | 'secondary'
    > = {
      pending: 'info',
      approved: 'success',
      rejected: 'danger',
      cancelled: 'secondary',
    };

    return severities[status];
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

  openEdit(application: CreditApplication): void {
    if (application.status !== 'pending') {
      return;
    }

    this.editing.set(application);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: CreditApplicationPayload): void {
    const current = this.editing();
    this.saving.set(true);

    const editablePayload = {
      member_id: payload.member_id,
      reference_id: payload.reference_id ?? null,
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
          current
            ? 'Solicitud de crédito actualizada'
            : 'Solicitud de crédito creada',
        );

        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error(
          'No se pudo guardar la solicitud',
          toApiMessage(error),
        );
      },
    });
  }

  cancelApplication(application: CreditApplication): void {
    if (application.status !== 'pending') {
      return;
    }

    this.confirmation.confirm({
      header: 'Cancelar solicitud de crédito',
      message:
        `¿Deseas cancelar la solicitud #${application.id} ` +
        `del socio ${this.memberName()(application.member_id)}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cancelar solicitud',
      rejectLabel: 'Volver',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deactivate(application.id).subscribe({
          next: () => {
            this.notify.success('Solicitud de crédito cancelada');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo cancelar la solicitud',
              toApiMessage(error),
            );
          },
        });
      },
    });
  }
}
