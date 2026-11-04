import { DatePipe } from '@angular/common';
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
import { AuthSession } from '../../core/services/auth-session';
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
  imports: [ButtonModule, MessageModule, PageHeader, RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly session = inject(AuthSession);
  private readonly memberApi = inject(MemberApi);
  private readonly accountApi = inject(AccountApi);
  private readonly movementApi = inject(MovementApi);
  private readonly applicationApi = inject(CreditApplicationApi);
  private readonly creditApi = inject(CreditApi);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly failedResources = signal<string[]>([]);

  readonly canViewMembers = computed(() =>
    this.session.can('GET', '/api/members'),
  );
  readonly canViewAccounts = computed(() =>
    this.session.can('GET', '/api/accounts'),
  );
  readonly canViewMovements = computed(() =>
    this.session.can('GET', '/api/movements'),
  );
  readonly canViewApplications = computed(() =>
    this.session.can('GET', '/api/credit-applications'),
  );
  readonly canViewCredits = computed(() =>
    this.session.can('GET', '/api/credits'),
  );

  readonly members = signal<Member[]>([]);
  readonly accounts = signal<Account[]>([]);
  readonly movements = signal<Movement[]>([]);
  readonly creditApplications = signal<CreditApplication[]>([]);
  readonly credits = signal<Credit[]>([]);

  readonly memberCount = computed(() => this.members().length);
  readonly activeMemberCount = computed(
    () => this.members().filter((member) => member.isActive).length,
  );

  readonly accountCount = computed(() => this.accounts().length);
  readonly activeAccountCount = computed(
    () => this.accounts().filter((account) => account.status === 'active').length,
  );

  readonly movementCount = computed(() => this.movements().length);
  readonly activeMovementCount = computed(
    () => this.movements().filter((movement) => movement.status === 'active').length,
  );

  readonly creditApplicationCount = computed(
    () => this.creditApplications().length,
  );
  readonly pendingCreditApplicationCount = computed(
    () => this.creditApplications().filter(
      (application) => application.status === 'pending',
    ).length,
  );

  readonly creditCount = computed(() => this.credits().length);
  readonly activeCreditCount = computed(
    () => this.credits().filter((credit) => credit.status === 'active').length,
  );

  readonly approvedAmount = computed(() =>
    this.credits().reduce(
      (sum, credit) => sum + toNumber(credit.approved_amount),
      0,
    ),
  );

  readonly metrics = computed<DashboardMetrics>(() => ({
    memberCount: this.memberCount(),
    activeMemberCount: this.activeMemberCount(),
    accountCount: this.accountCount(),
    activeAccountCount: this.activeAccountCount(),
    movementCount: this.movementCount(),
    activeMovementCount: this.activeMovementCount(),
    creditApplicationCount: this.creditApplicationCount(),
    pendingCreditApplicationCount: this.pendingCreditApplicationCount(),
    creditCount: this.creditCount(),
    activeCreditCount: this.activeCreditCount(),
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

  private permittedList<T>(
    path: string,
    request: Observable<T[]>,
  ): Observable<ResourceResult<T>> {
    return this.session.can('GET', path)
      ? this.safeList(request)
      : of({ data: [], failed: false });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.failedResources.set([]);

    const permittedCount = [
      '/api/members',
      '/api/accounts',
      '/api/movements',
      '/api/credit-applications',
      '/api/credits',
    ].filter((path) => this.session.can('GET', path)).length;

    forkJoin({
      members: this.permittedList('/api/members', this.memberApi.list()),
      accounts: this.permittedList('/api/accounts', this.accountApi.list()),
      movements: this.permittedList('/api/movements', this.movementApi.list()),
      applications: this.permittedList(
        '/api/credit-applications',
        this.applicationApi.list(),
      ),
      credits: this.permittedList('/api/credits', this.creditApi.list()),
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

        if (permittedCount > 0 && failed.length === permittedCount) {
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

  toNumber(value: number | string): number {
    return toNumber(value);
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 2,
    }).format(amount);
  }
}
