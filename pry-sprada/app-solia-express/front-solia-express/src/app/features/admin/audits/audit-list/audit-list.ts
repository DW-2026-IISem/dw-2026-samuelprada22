import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';

import { Audit } from '../../../../core/models/audit.model';
import { toApiMessage } from '../../../../core/utils/api-error';
import { filterRows } from '../../../../core/utils/filter-rows';

import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';

import { AuditApi } from '../audit-api';

@Component({
  host: { class: 'block' },
  selector: 'app-audit-list',
  imports: [
    ButtonModule,
    DatePipe,
    DialogModule,
    EmptyState,
    InputTextModule,
    MessageModule,
    PageHeader,
    TableModule,
  ],
  templateUrl: './audit-list.html',
  styleUrl: './audit-list.css',
})
export class AuditList {
  private readonly api = inject(AuditApi);

  readonly rows = signal<Audit[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');

  readonly selectedAudit = signal<Audit | null>(null);
  readonly detailVisible = signal(false);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (audit) => [
      audit.id,
      audit.actor_user_id,
      audit.action,
      audit.entity,
      audit.entity_id,
      audit.data,
      audit.createdAt,
    ]),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.list().subscribe({
      next: (audits) => {
        this.rows.set(audits);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  openDetail(audit: Audit): void {
    this.selectedAudit.set(audit);
    this.detailVisible.set(true);
    this.detailLoading.set(true);
    this.detailError.set(null);

    this.api.get(audit.id).subscribe({
      next: (detail) => {
        this.selectedAudit.set(detail);
        this.detailLoading.set(false);
      },
      error: (error: unknown) => {
        this.detailError.set(toApiMessage(error));
        this.detailLoading.set(false);
      },
    });
  }

  formatData(data: string | null): string {
    if (!data) {
      return 'Sin datos adicionales.';
    }

    try {
      return JSON.stringify(JSON.parse(data), null, 2);
    } catch {
      return data;
    }
  }
}
