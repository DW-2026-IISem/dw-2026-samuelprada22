import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { RoleUser, RoleUserPayload } from '../../../../core/models/role-user.model';
import { NotificationService } from '../../../../core/services/notification';
import { toApiMessage } from '../../../../core/utils/api-error';
import { filterRows } from '../../../../core/utils/filter-rows';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';
import { RoleUserApi } from '../role-user-api';
import { RoleUserForm } from '../role-user-form/role-user-form';

@Component({
  host: { class: 'block' },
  selector: 'app-role-user-list',
  imports: [
    ButtonModule,
    DialogModule,
    EmptyState,
    HasPermissionDirective,
    InputTextModule,
    MessageModule,
    PageHeader,
    RoleUserForm,
    StatusTag,
    TableModule,
    TooltipModule,
  ],
  templateUrl: './role-user-list.html',
})
export class RoleUserList {
  private readonly api = inject(RoleUserApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<RoleUser[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (assignment) => [
      assignment.id,
      assignment.user_id,
      assignment.user?.username ?? '',
      assignment.user?.email ?? '',
      assignment.role_id,
      assignment.role?.name ?? '',
      assignment.status,
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
      next: (assignments) => {
        this.rows.set(assignments);
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

  save(payload: RoleUserPayload): void {
    this.saving.set(true);

    this.api.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success('Rol asignado correctamente');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error(
          'No se pudo asignar el rol',
          toApiMessage(error),
        );
      },
    });
  }

  deactivate(assignment: RoleUser): void {
    const username = assignment.user?.username ??
      `usuario #${assignment.user_id}`;
    const roleName = assignment.role?.name ??
      `rol #${assignment.role_id}`;

    this.confirmation.confirm({
      header: 'Desactivar asignación',
      message: `¿Deseas retirar el rol ${roleName} al usuario ${username}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deactivate(assignment.id).subscribe({
          next: () => {
            this.notify.success('Asignación desactivada');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo desactivar la asignación',
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
