import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  Credit,
  CreditPayload,
  CreditStatus,
} from '../../../core/models/credit.model';
import { CreditApplication } from '../../../core/models/credit-application.model';
import { Rate } from '../../../core/models/rate.model';
import { Member } from '../../../core/models/member.model';

import { NotificationService } from '../../../core/services/notification';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';

import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

import { CreditApi } from '../credit-api';
import { CreditApplicationApi } from '../../credit-applications/credit-application-api';
import { RateApi } from '../../rates/rate-api';
import { MemberApi } from '../../members/member-api';
import { CreditForm } from '../credit-form/credit-form';

@Component({
  host: { class: 'block' },
  selector: 'app-credit-list',
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
    RouterLink,
    CreditForm,
  ],
  templateUrl: './credit-list.html',
  styleUrl: './credit-list.css',
})
export class CreditList {
  private readonly api = inject(CreditApi);
  private readonly applicationApi = inject(CreditApplicationApi);
  private readonly rateApi = inject(RateApi);
  private readonly memberApi = inject(MemberApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<Credit[]>([]);
  readonly applications = signal<CreditApplication[]>([]);
  readonly rates = signal<Rate[]>([]);
  readonly members = signal<Member[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly applicationsError = signal(false);
  readonly ratesError = signal(false);
  readonly membersError = signal(false);

  readonly filter = signal('');

  readonly dialogVisible = signal(false);
  readonly editing = signal<Credit | null>(null);
  readonly resetKey = signal(0);

  readonly title = computed(() =>
    this.editing() ? 'Editar crédito' : 'Nuevo crédito',
  );

  readonly applicationFor = computed(() => {
    const map = new Map(
      this.applications().map((application) => [
        application.id,
        application,
      ]),
    );

    return (id: number) => map.get(id);
  });

  readonly rateFor = computed(() => {
    const map = new Map(
      this.rates().map((rate) => [rate.id, rate]),
    );

    return (id: number) => map.get(id);
  });

  readonly memberName = computed(() => {
    const map = new Map(
      this.members().map((member) => [member.id, member.name]),
    );

    return (id: number) => map.get(id) ?? `Socio #${id}`;
  });

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (credit) => {
      const application = this.applicationFor()(
        credit.credit_application_id,
      );
      const rate = this.rateFor()(credit.rate_id);

      return [
        credit.id,
        credit.credit_application_id,
        application?.reference_id,
        application?.member_id,
        application
          ? this.memberName()(application.member_id)
          : '',
        rate?.name,
        credit.date,
        credit.approved_amount,
        credit.term,
        credit.interest_rate,
        credit.observations,
        credit.status,
        this.statusLabel(credit.status),
      ];
    }),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.applicationsError.set(false);
    this.ratesError.set(false);
    this.membersError.set(false);

    forkJoin({
      credits: this.api.list(),

      applications: this.applicationApi.list().pipe(
        catchError(() => {
          this.applicationsError.set(true);
          return of([] as CreditApplication[]);
        }),
      ),

      rates: this.rateApi.list().pipe(
        catchError(() => {
          this.ratesError.set(true);
          return of([] as Rate[]);
        }),
      ),

      members: this.memberApi.list().pipe(
        catchError(() => {
          this.membersError.set(true);
          return of([] as Member[]);
        }),
      ),
    }).subscribe({
      next: ({ credits, applications, rates, members }) => {
        this.rows.set(credits);
        this.applications.set(applications);
        this.rates.set(rates);
        this.members.set(members);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.applications.set([]);
        this.rates.set([]);
        this.members.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  statusLabel(status: CreditStatus): string {
    const labels: Record<CreditStatus, string> = {
      active: 'Activo',
      paid: 'Pagado',
      cancelled: 'Cancelado',
    };

    return labels[status];
  }

  statusSeverity(
    status: CreditStatus,
  ): 'success' | 'info' | 'secondary' {
    const severities: Record<
      CreditStatus,
      'success' | 'info' | 'secondary'
    > = {
      active: 'success',
      paid: 'info',
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

  formatPercentage(value: number | string): string {
    return `${Number(value).toLocaleString('es-CO', {
      maximumFractionDigits: 2,
    })}%`;
  }

  openCreate(): void {
    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(credit: Credit): void {
    this.editing.set(credit);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: CreditPayload): void {
    const current = this.editing();
    this.saving.set(true);

    const editablePayload = {
      credit_application_id: payload.credit_application_id,
      rate_id: payload.rate_id,
      date: payload.date,
      approved_amount: payload.approved_amount,
      term: payload.term,
      interest_rate: payload.interest_rate,
      observations: payload.observations ?? null,
    };

    const request = current
      ? this.api.update(current.id, editablePayload)
      : this.api.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);

        this.notify.success(
          current ? 'Crédito actualizado' : 'Crédito creado',
        );

        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error(
          'No se pudo guardar el crédito',
          toApiMessage(error),
        );
      },
    });
  }

  cancelCredit(credit: Credit): void {
    if (credit.status === 'cancelled') {
      return;
    }

    this.confirmation.confirm({
      header: 'Cancelar crédito',
      message:
        `¿Deseas cancelar el crédito #${credit.id} ` +
        `del socio ${this.creditMemberName(credit)}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Cancelar crédito',
      rejectLabel: 'Volver',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deactivate(credit.id).subscribe({
          next: () => {
            this.notify.success('Crédito cancelado');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo cancelar el crédito',
              toApiMessage(error),
            );
          },
        });
      },
    });
  }

  private creditMemberName(credit: Credit): string {
    const application = this.applicationFor()(
      credit.credit_application_id,
    );

    return application
      ? this.memberName()(application.member_id)
      : `Solicitud #${credit.credit_application_id}`;
  }
}
