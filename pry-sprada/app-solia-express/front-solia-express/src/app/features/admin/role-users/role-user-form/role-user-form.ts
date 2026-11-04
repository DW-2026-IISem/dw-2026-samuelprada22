import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { Role } from '../../../../core/models/role.model';
import { RoleUserPayload } from '../../../../core/models/role-user.model';
import { User } from '../../../../core/models/user.model';
import { toApiMessage } from '../../../../core/utils/api-error';
import { RoleApi } from '../../roles/role-api';
import { UserApi } from '../../users/user-api';

@Component({
  host: { class: 'block' },
  selector: 'app-role-user-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    MessageModule,
    SelectModule,
  ],
  templateUrl: './role-user-form.html',
})
export class RoleUserForm {
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<RoleUserPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly userApi = inject(UserApi);
  private readonly roleApi = inject(RoleApi);

  readonly users = signal<User[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly catalogLoading = signal(true);
  readonly catalogError = signal<string | null>(null);

  readonly userOptions = computed(() =>
    this.users().map((user) => ({
      ...user,
      label: `${user.username} · ${user.email}`,
    })),
  );

  readonly roleOptions = computed(() =>
    this.roles().map((role) => ({
      ...role,
      label: role.name,
    })),
  );

  readonly form = this.fb.group({
    user_id: [0, [Validators.required, Validators.min(1)]],
    role_id: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    effect(() => {
      this.resetKey();
      this.form.reset({
        user_id: 0,
        role_id: 0,
      });
    });

    this.loadCatalogs();
  }

  loadCatalogs(): void {
    this.catalogLoading.set(true);
    this.catalogError.set(null);

    forkJoin({
      users: this.userApi.list(),
      roles: this.roleApi.list(),
    }).subscribe({
      next: ({ users, roles }) => {
        this.users.set(users.filter((user) => user.status === 'active'));
        this.roles.set(roles.filter((role) => role.status === 'active'));
        this.catalogLoading.set(false);
      },
      error: (error: unknown) => {
        this.users.set([]);
        this.roles.set([]);
        this.catalogError.set(toApiMessage(error));
        this.catalogLoading.set(false);
      },
    });
  }

  submit(): void {
    if (
      this.saving() ||
      this.catalogLoading() ||
      this.users().length === 0 ||
      this.roles().length === 0
    ) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.saved.emit({
      user_id: value.user_id,
      role_id: value.role_id,
    });
  }
}
