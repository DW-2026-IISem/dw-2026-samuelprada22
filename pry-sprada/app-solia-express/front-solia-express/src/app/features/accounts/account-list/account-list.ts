import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { Account, AccountPayload } from '../../../core/models/account.model';
import { Member } from '../../../core/models/member.model';
import { NotificationService } from '../../../core/services/notification';
import { toApiMessage } from '../../../core/utils/api-error';
import { filterRows } from '../../../core/utils/filter-rows';

import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';

import { MemberApi } from '../../members/member-api';
import { AccountApi } from '../account-api';
import { AccountForm } from '../account-form/account-form';

@Component({
  host: { class: 'block' },
  selector: 'app-account-list',
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
    AccountForm,
  ],
  templateUrl: './account-list.html',
  styleUrl: './account-list.css',
})
export class AccountList {
  private readonly api = inject(AccountApi);
  private readonly memberApi = inject(MemberApi);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rows = signal<Account[]>([]);
  readonly members = signal<Member[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly membersError = signal(false);
  readonly filter = signal('');

  readonly visibleRows = computed(() =>
    filterRows(this.rows(), this.filter(), (account) => [
      account.id,
      account.name,
      account.description,
      account.status,
      this.memberName(account.member_id),
    ]),
  );

  readonly dialogVisible = signal(false);
  readonly editing = signal<Account | null>(null);
  readonly resetKey = signal(0);

  readonly title = computed(() =>
    this.editing() ? 'Editar cuenta' : 'Nueva cuenta',
  );

  constructor() {
    this.load();
    this.loadMembers();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.list().subscribe({
      next: (accounts) => {
        this.rows.set(accounts);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  private loadMembers(): void {
    this.membersError.set(false);

    this.memberApi.list().subscribe({
      next: (members) => {
        this.members.set(members);
      },
      error: () => {
        this.members.set([]);
        this.membersError.set(true);
      },
    });
  }

  memberName(memberId: number): string {
    const member = this.members().find((item) => item.id === memberId);
    return member?.name ?? `Socio #${memberId}`;
  }

  openCreate(): void {
    this.editing.set(null);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  openEdit(account: Account): void {
    this.editing.set(account);
    this.resetKey.update((key) => key + 1);
    this.dialogVisible.set(true);
  }

  save(payload: AccountPayload): void {
    const current = this.editing();
    this.saving.set(true);

    const request = current
      ? this.api.update(current.id, {
          member_id: payload.member_id,
          name: payload.name,
          description: payload.description,
        })
      : this.api.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.notify.success(
          current ? 'Cuenta actualizada' : 'Cuenta creada',
        );
        this.load();
        this.loadMembers();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error(
          'No se pudo guardar la cuenta',
          toApiMessage(error),
        );
      },
    });
  }

  deactivate(account: Account): void {
    this.confirmation.confirm({
      header: 'Desactivar cuenta',
      message: `¿Deseas desactivar la cuenta "${account.name}" de ${this.memberName(account.member_id)}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deactivate(account.id).subscribe({
          next: () => {
            this.notify.success('Cuenta desactivada');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo desactivar la cuenta',
              toApiMessage(error),
            );
          },
        });
      },
    });
  }

  remove(account: Account): void {
    this.confirmation.confirm({
      header: 'Eliminar cuenta',
      message: `¿Deseas eliminar permanentemente la cuenta "${account.name}"? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar definitivamente',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.remove(account.id).subscribe({
          next: () => {
            this.notify.success('Cuenta eliminada');
            this.load();
          },
          error: (error: unknown) => {
            this.notify.error(
              'No se pudo eliminar la cuenta',
              toApiMessage(error),
            );
          },
        });
      },
    });
  }
}
