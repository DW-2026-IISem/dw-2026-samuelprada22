import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from '../../../../core/models/user.model';
import { NotificationService } from '../../../../core/services/notification';
import { toApiMessage } from '../../../../core/utils/api-error';
import { filterRows } from '../../../../core/utils/filter-rows';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';
import { UserApi } from '../user-api';
import { UserForm } from '../user-form/user-form';

@Component({
  host: { class: 'block' },
  selector: 'app-user-list',
  imports: [
    ButtonModule,
    DialogModule,
    EmptyState,
    HasPermissionDirective,
    InputTextModule,
    MessageModule,
    PageHeader,
    StatusTag,
    TableModule,
    TooltipModule,
    UserForm,
  ],
  templateUrl: './user-list.html',
})
export class UserList {
  private readonly api = inject(UserApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<User[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (user) => [
      user.id,
      user.username,
      user.email,
      user.status,
    ]),
  );

  readonly dialogVisible = signal(false);
  readonly editing = signal<User | null>(null);
  readonly resetKey = signal(0);

  readonly title = computed(() =>
    this.editing() ? 'Editar usuario' : 'Nuevo usuario',
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.list().subscribe({
      next: (users) => {
        this.rows.set(users);
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
    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(user: User): void {
    this.editing.set(user);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: CreateUserPayload | UpdateUserPayload): void {
    const current = this.editing();
    this.saving.set(true);

    const request = current
      ? this.api.update(current.id, {
          username: payload.username,
          email: payload.email,
          avatar: payload.avatar,
        })
      : this.api.create(payload as CreateUserPayload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(
          current ? 'Usuario actualizado' : 'Usuario creado',
        );
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar el usuario', toApiMessage(error));
      },
    });
  }

  deactivate(user: User): void {
    this.confirmation.confirm({
      header: 'Desactivar usuario',
      message: `¿Deseas desactivar al usuario ${user.username}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deactivate(user.id).subscribe({
          next: () => {
            this.notify.success('Usuario desactivado');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo desactivar el usuario',
              toApiMessage(error),
            );
          },
        });
      },
    });
  }

  remove(user: User): void {
    this.confirmation.confirm({
      header: 'Eliminar usuario',
      message: `¿Deseas eliminar permanentemente a ${user.username}? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar definitivamente',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.remove(user.id).subscribe({
          next: () => {
            this.notify.success('Usuario eliminado');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo eliminar el usuario',
              toApiMessage(error),
            );
          },
        });
      },
    });
  }
}
