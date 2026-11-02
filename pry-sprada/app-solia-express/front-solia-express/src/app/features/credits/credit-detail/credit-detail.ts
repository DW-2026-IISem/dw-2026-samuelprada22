import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';

import { Credit, CreditStatus } from '../../../core/models/credit.model';
import { CreditApplication } from '../../../core/models/credit-application.model';
import { Member } from '../../../core/models/member.model';
import { Rate } from '../../../core/models/rate.model';

import { toApiMessage } from '../../../core/utils/api-error';

import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

import { CreditApi } from '../credit-api';
import { CreditApplicationApi } from '../../credit-applications/credit-application-api';
import { MemberApi } from '../../members/member-api';
import { RateApi } from '../../rates/rate-api';

@Component({
  selector: 'app-credit-detail',
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
  templateUrl: './credit-detail.html',
  styleUrl: './credit-detail.css',
})
export class CreditDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly creditApi = inject(CreditApi);
  private readonly applicationApi = inject(CreditApplicationApi);
  private readonly memberApi = inject(MemberApi);
  private readonly rateApi = inject(RateApi);

  readonly credit = signal<Credit | null>(null);
  readonly application = signal<CreditApplication | null>(null);
  readonly member = signal<Member | null>(null);
  readonly rate = signal<Rate | null>(null);

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
      this.error.set('El identificador del crédito no es válido.');
      this.loading.set(false);
      return;
    }

    this.creditApi.get(id).pipe(
      switchMap((credit) =>
        forkJoin({
          application: this.applicationApi.get(
            credit.credit_application_id,
          ).pipe(catchError(() => of(null))),

          rate: this.rateApi.get(credit.rate_id).pipe(
            catchError(() => of(null)),
          ),
        }).pipe(
          switchMap(({ application, rate }) => {
            if (!application) {
              return of({
                credit,
                application,
                rate,
                member: null,
              });
            }

            return this.memberApi.get(application.member_id).pipe(
              map((member) => ({
                credit,
                application,
                rate,
                member,
              })),
              catchError(() =>
                of({
                  credit,
                  application,
                  rate,
                  member: null,
                }),
              ),
            );
          }),
        ),
      ),
    ).subscribe({
      next: ({ credit, application, rate, member }) => {
        this.credit.set(credit);
        this.application.set(application);
        this.rate.set(rate);
        this.member.set(member);

        this.relatedDataWarning.set(
          !application || !rate || (!!application && !member),
        );

        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.credit.set(null);
        this.application.set(null);
        this.rate.set(null);
        this.member.set(null);
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
}
