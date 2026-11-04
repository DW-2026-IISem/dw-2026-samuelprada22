
import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import {
  Resource,
  ResourcePayload,
  UpdateResourcePayload,
} from '../../../../core/models/resource.model';
import { NotificationService } from '../../../../core/services/notification';
import { toApiMessage } from '../../../../core/utils/api-error';
import { filterRows } from '../../../../core/utils/filter-rows';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../../shared/ui/status-tag/status-tag';
import { ResourceApi } from '../resource-api';
import { ResourceForm } from '../resource-form/resource-form';

@Component({
  host: { class: 'block' },
  selector: 'app-resource-list',
  imports: [
    ButtonModule,
    DialogModule,
    EmptyState,
    HasPermissionDirective,
    InputTextModule,
    MessageModule,
    PageHeader,
    ResourceForm,
    StatusTag,
    TableModule,
    TooltipModule,
  ],
  templateUrl: './resource-list.html',
})
export class ResourceList {
  private readonly api = inject(ResourceApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<Resource[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (resource) => [
      resource.id,
      resource.method,
      resource.path,
      resource.description,
      resource.status,
    ]),
  );

  readonly dialogVisible = signal(false);
  readonly editing = signal<Resource | null>(null);
  readonly resetKey = signal(0);

  readonly title = computed(() =>
    this.editing() ? 'Editar recurso' : 'Nuevo recurso',
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.list().subscribe({
      next: (resources) => {
        this.rows.set(resources);
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

  openEdit(resource: Resource): void {
    this.editing.set(resource);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: ResourcePayload | UpdateResourcePayload): void {
    const current = this.editing();
    this.saving.set(true);

    const request = current
      ? this.api.update(current.id, {
          method: payload.method,
          path: payload.path,
          description: payload.description,
        })
      : this.api.create(payload as ResourcePayload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(
          current ? 'Recurso actualizado' : 'Recurso creado',
        );
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error(
          'No se pudo guardar el recurso',
          toApiMessage(error),
        );
      },
    });
  }

  deactivate(resource: Resource): void {
    this.confirmation.confirm({
      header: 'Desactivar recurso',
      message: `¿Deseas desactivar ${resource.method} ${resource.path}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deactivate(resource.id).subscribe({
          next: () => {
            this.notify.success('Recurso desactivado');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo desactivar el recurso',
              toApiMessage(error),
            );
          },
        });
      },
    });
  }

  remove(resource: Resource): void {
    this.confirmation.confirm({
      header: 'Eliminar recurso',
      message: `¿Deseas eliminar permanentemente ${resource.method} ${resource.path}? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar definitivamente',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.remove(resource.id).subscribe({
          next: () => {
            this.notify.success('Recurso eliminado');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo eliminar el recurso',
              toApiMessage(error),
            );
          },
        });
      },
    });
  }
}
