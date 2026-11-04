import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { catchError, forkJoin, of } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import {
  CommitteeDecision,
  CommitteeDecisionPayload,
  CommitteeDecisionType,
  UpdateCommitteeDecisionPayload,
} from '../../../core/models/committee-decision.model';
import { CreditApplication } from '../../../core/models/credit-application.model';
import { Member } from '../../../core/models/member.model';
import { toNumber } from '../../../core/models/api.model';

import { NotificationService } from '../../../core/services/notification';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';

import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

import { CreditApplicationApi } from '../../credit-applications/credit-application-api';
import { MemberApi } from '../../members/member-api';
import { CommitteeDecisionApi } from '../committee-decision-api';
import { CommitteeDecisionForm } from '../committee-decision-form/committee-decision-form';

@Component({
  host: { class: 'block' },
  selector: 'app-committee-decision-list',
  imports: [
    ButtonModule,
    DialogModule,
    EmptyState,
    HasPermissionDirective,
    InputTextModule,
    MessageModule,
    PageHeader,
    CommitteeDecisionForm,
    TableModule,
    TooltipModule,
  ],
  templateUrl: './committee-decision-list.html',
})
export class CommitteeDecisionList {
  private readonly api = inject(CommitteeDecisionApi);
  private readonly applicationApi = inject(CreditApplicationApi);
  private readonly memberApi = inject(MemberApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<CommitteeDecision[]>([]);
  readonly applications = signal<CreditApplication[]>([]);
  readonly members = signal<Member[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly applicationsError = signal(false);
  readonly membersError = signal(false);

  readonly filter = signal('');

  readonly dialogVisible = signal(false);
  readonly editing = signal<CommitteeDecision | null>(null);
  readonly resetKey = signal(0);

  readonly pendingApplications = computed(() => {
    const decidedApplicationIds = new Set(
      this.rows().map((decision) => decision.credit_application_id),
    );

    return this.applications().filter(
      (application) =>
        application.status === 'pending' &&
        !decidedApplicationIds.has(application.id),
    );
  });

  readonly formApplications = computed(() =>
    this.editing() ? this.applications() : this.pendingApplications(),
  );

  readonly title = computed(() =>
    this.editing() ? 'Editar decisión' : 'Nueva decisión del comité',
  );

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (decision) => [
      decision.id,
      decision.credit_application_id,
      this.applicationLabel(decision.credit_application_id),
      this.memberName(decision.credit_application_id),
      this.decisionLabel(decision.decision),
      decision.decision_date,
      decision.comments,
    ]),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.applicationsError.set(false);
    this.membersError.set(false);

    forkJoin({
      decisions: this.api.list(),
      applications: this.applicationApi.list().pipe(
        catchError(() => {
          this.applicationsError.set(true);
          return of([]);
        }),
      ),
      members: this.memberApi.list().pipe(
        catchError(() => {
          this.membersError.set(true);
          return of([]);
        }),
      ),
    }).subscribe({
      next: ({ decisions, applications, members }) => {
        this.rows.set(decisions);
        this.applications.set(applications);
        this.members.set(members);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  applicationLabel(applicationId: number): string {
    const application = this.applications().find(
      (item) => item.id === applicationId,
    );

    return application
      ? `Solicitud #${application.id}`
      : `Solicitud #${applicationId}`;
  }

  memberName(applicationId: number): string {
    const application = this.applications().find(
      (item) => item.id === applicationId,
    );

    if (!application) {
      return 'Socio no disponible';
    }

    const member = this.members().find(
      (item) => item.id === application.member_id,
    );

    return member?.name ?? `Socio #${application.member_id}`;
  }

  applicationAmount(applicationId: number): string {
    const application = this.applications().find(
      (item) => item.id === applicationId,
    );

    if (!application) {
      return '—';
    }

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 2,
    }).format(toNumber(application.amount));
  }

  decisionLabel(decision: CommitteeDecisionType): string {
    const labels: Record<CommitteeDecisionType, string> = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
      observed: 'Observada',
    };

    return labels[decision];
  }

  formatDate(value: string | null): string {
    if (!value) {
      return '—';
    }

    const date = new Date(`${value.slice(0, 10)}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat('es-CO').format(date);
  }

  openCreate(): void {
    if (this.pendingApplications().length === 0) {
      this.notify.warn('No hay solicitudes pendientes para decidir');
      return;
    }

    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(decision: CommitteeDecision): void {
    this.editing.set(decision);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: CommitteeDecisionPayload): void {
    const current = this.editing();
    this.saving.set(true);

    const updatePayload: UpdateCommitteeDecisionPayload = {
      credit_application_id: payload.credit_application_id,
      decision: payload.decision,
      decision_date: payload.decision_date,
      comments: payload.comments,
    };

    const request = current
      ? this.api.update(current.id, updatePayload)
      : this.api.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);

        this.notify.success(
          current ? 'Decisión actualizada' : 'Decisión registrada',
        );

        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error(
          'No se pudo guardar la decisión',
          toApiMessage(error),
        );
      },
    });
  }

  deactivate(decision: CommitteeDecision): void {
    this.confirmation.confirm({
      header: 'Cancelar decisión',
      message: `¿Deseas cancelar la decisión de la solicitud #${decision.credit_application_id}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cancelar decisión',
      rejectLabel: 'Volver',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deactivate(decision.id).subscribe({
          next: () => {
            this.notify.success('Decisión cancelada');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo cancelar la decisión',
              toApiMessage(error),
            );
          },
        });
      },
    });
  }
}
