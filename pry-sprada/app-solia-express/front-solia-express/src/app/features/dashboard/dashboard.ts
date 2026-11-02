import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

import { Account } from '../../core/models/account.model';
import { CreditApplication } from '../../core/models/credit-application.model';
import { Credit } from '../../core/models/credit.model';
import { Dashboard as DashboardMetrics } from '../../core/models/dashboard.model';
import { Member } from '../../core/models/member.model';
import { Movement } from '../../core/models/movement.model';
import { toNumber } from '../../core/models/api.model';

import { AccountApi } from '../accounts/account-api';
import { CreditApplicationApi } from '../credit-applications/credit-application-api';
import { CreditApi } from '../credits/credit-api';
import { MemberApi } from '../members/member-api';
import { MovementApi } from '../movements/movement-api';

import { PageHeader } from '../../shared/ui/page-header/page-header';

interface ResourceResult<T> {
  data: T[];
  failed: boolean;
}

@Component({
  selector: 'app-dashboard',
  host: { class: 'block' },
  imports: [ButtonModule, MessageModule, PageHeader, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly memberApi = inject(MemberApi);
  private readonly accountApi = inject(AccountApi);
  private readonly movementApi = inject(MovementApi);
  private readonly applicationApi = inject(CreditApplicationApi);
  private readonly creditApi = inject(CreditApi);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly failedResources = signal<string[]>([]);

  readonly members = signal<Member[]>([]);
  readonly accounts = signal<Account[]>([]);
  readonly movements = signal<Movement[]>([]);
  readonly creditApplications = signal<CreditApplication[]>([]);
  readonly credits = signal<Credit[]>([]);

  readonly memberCount = computed(() => this.members().length);
  readonly accountCount = computed(() => this.accounts().length);
  readonly movementCount = computed(() => this.movements().length);
  readonly creditApplicationCount = computed(
    () => this.creditApplications().length,
  );
  readonly creditCount = computed(() => this.credits().length);

  readonly approvedAmount = computed(() =>
    this.credits().reduce(
      (sum, credit) => sum + toNumber(credit.approved_amount),
      0,
    ),
  );

  readonly metrics = computed<DashboardMetrics>(() => ({
    memberCount: this.memberCount(),
    accountCount: this.accountCount(),
    movementCount: this.movementCount(),
    creditApplicationCount: this.creditApplicationCount(),
    creditCount: this.creditCount(),
    approvedAmount: this.approvedAmount(),
  }));

  readonly hasPartialError = computed(
    () => this.failedResources().length > 0 && !this.error(),
  );

  constructor() {
    this.load();
  }

  private safeList<T>(
    request: Observable<T[]>,
  ): Observable<ResourceResult<T>> {
    return request.pipe(
      map((data) => ({ data, failed: false })),
      catchError(() => of({ data: [], failed: true })),
    );
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.failedResources.set([]);

    forkJoin({
      members: this.safeList(this.memberApi.list()),
      accounts: this.safeList(this.accountApi.list()),
      movements: this.safeList(this.movementApi.list()),
      applications: this.safeList(this.applicationApi.list()),
      credits: this.safeList(this.creditApi.list()),
    }).subscribe({
      next: (result) => {
        this.members.set(result.members.data);
        this.accounts.set(result.accounts.data);
        this.movements.set(result.movements.data);
        this.creditApplications.set(result.applications.data);
        this.credits.set(result.credits.data);

        const failed = Object.entries(result)
          .filter(([, resource]) => resource.failed)
          .map(([name]) => name);

        this.failedResources.set(failed);

        if (failed.length === 5) {
          this.error.set(
            'No se pudo cargar la información del dashboard. Verifica tu conexión y tus permisos.',
          );
        }

        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información del dashboard.');
        this.loading.set(false);
      },
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 2,
    }).format(amount);
  }
}
