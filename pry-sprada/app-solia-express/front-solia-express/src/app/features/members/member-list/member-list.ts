import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Member, MemberPayload } from '../../../core/models/member.model';
import { NotificationService } from '../../../core/services/notification';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { MemberApi } from '../member-api';
import { MemberForm } from '../member-form/member-form';

@Component({
  host: { class: 'block' },
  selector: 'app-member-list',
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
    MemberForm,
  ],
  templateUrl: './member-list.html',
  styleUrl: './member-list.css',
})
export class MemberList {
  private readonly api = inject(MemberApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<Member[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly filter = signal('');

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (member) => [
      member.id,
      member.name,
      member.description,
      member.isActive ? 'activo' : 'inactivo',
    ]),
  );

  readonly dialogVisible = signal(false);
  readonly editing = signal<Member | null>(null);
  readonly resetKey = signal(0);

  readonly title = computed(() =>
    this.editing() ? 'Editar socio' : 'Nuevo socio',
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.list().subscribe({
      next: (members) => {
        this.rows.set(members);
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

  openEdit(member: Member): void {
    this.editing.set(member);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: MemberPayload): void {
    const current = this.editing();
    this.saving.set(true);

    const request = current
      ? this.api.update(current.id, payload)
      : this.api.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(
          current ? 'Socio actualizado' : 'Socio creado',
        );
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error('No se pudo guardar', toApiMessage(error));
      },
    });
  }

  deactivate(member: Member): void {
    this.confirmation.confirm({
      header: 'Desactivar socio',
      message: `¿Deseas desactivar a ${member.name}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deactivate(member.id).subscribe({
          next: () => {
            this.notify.success('Socio desactivado');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo desactivar el socio',
              toApiMessage(error),
            );
          },
        });
      },
    });
  }

  remove(member: Member): void {
    this.confirmation.confirm({
      header: 'Eliminar socio',
      message: `¿Deseas eliminar permanentemente a ${member.name}? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar definitivamente',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.remove(member.id).subscribe({
          next: () => {
            this.notify.success('Socio eliminado');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo eliminar el socio',
              toApiMessage(error),
            );
          },
        });
      },
    });
  }
}
