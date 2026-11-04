import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import {
  ResourceRole,
  ResourceRolePayload,
} from '../../../../core/models/resource-role.model';
import { NotificationService } from '../../../../core/services/notification';
import { toApiMessage } from '../../../../core/utils/api-error';
import { filterRows } from '../../../../core/utils/filter-rows';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';
import { ResourceRoleApi } from '../resource-role-api';
import { ResourceRoleForm } from '../resource-role-form/resource-role-form';

@Component({
  host: { class: 'block' },
  selector: 'app-resource-role-list',
  imports: [
    ButtonModule,
    DialogModule,
    EmptyState,
    HasPermissionDirective,
    InputTextModule,
    MessageModule,
    PageHeader,
    ResourceRoleForm,
    StatusTag,
    TableModule,
    TooltipModule,
  ],
  templateUrl: './resource-role-list.html',
})
export class ResourceRoleList {
  private readonly api = inject(ResourceRoleApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<ResourceRole[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (grant) => [
      grant.id,
      grant.role_id,
      grant.role?.name ?? '',
      grant.resource_id,
      grant.resource?.method ?? '',
      grant.resource?.path ?? '',
      grant.resource?.description ?? '',
      grant.status,
    ]),
  );

  readonly dialogVisible = signal(false);
  readonly resetKey = signal(0);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.list().subscribe({
      next: (grants) => {
        this.rows.set(grants);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: ResourceRolePayload): void {
    this.saving.set(true);

    this.api.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success('Concesión registrada correctamente');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error(
          'No se pudo conceder el recurso al rol',
          toApiMessage(error),
        );
      },
    });
  }

  deactivate(grant: ResourceRole): void {
    const roleName = grant.role?.name ?? `rol #${grant.role_id}`;
    const method = grant.resource?.method ?? 'HTTP';
    const path = grant.resource?.path ?? `recurso #${grant.resource_id}`;

    this.confirmation.confirm({
      header: 'Revocar concesión',
      message: `¿Deseas revocar el permiso ${method} ${path} al rol ${roleName}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Revocar permiso',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deactivate(grant.id).subscribe({
          next: () => {
            this.notify.success('Permiso revocado correctamente');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo revocar el permiso',
              toApiMessage(error),
            );
          },
        });
      },
    });
  }

  formatDate(value: string | Date | null | undefined): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  }
}
