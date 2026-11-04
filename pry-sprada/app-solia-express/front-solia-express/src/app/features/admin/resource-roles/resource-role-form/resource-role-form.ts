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
import { Resource } from '../../../../core/models/resource.model';
import { ResourceRolePayload } from '../../../../core/models/resource-role.model';
import { Role } from '../../../../core/models/role.model';
import { toApiMessage } from '../../../../core/utils/api-error';
import { ResourceApi } from '../../resources/resource-api';
import { RoleApi } from '../../roles/role-api';

@Component({
  host: { class: 'block' },
  selector: 'app-resource-role-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    MessageModule,
    SelectModule,
  ],
  templateUrl: './resource-role-form.html',
})
export class ResourceRoleForm {
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<ResourceRolePayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly roleApi = inject(RoleApi);
  private readonly resourceApi = inject(ResourceApi);

  readonly roles = signal<Role[]>([]);
  readonly resources = signal<Resource[]>([]);
  readonly catalogLoading = signal(true);
  readonly catalogError = signal<string | null>(null);

  readonly roleOptions = computed(() =>
    this.roles().map((role) => ({
      ...role,
      label: role.name,
    })),
  );

  readonly resourceOptions = computed(() =>
    this.resources().map((resource) => ({
      ...resource,
      label: `${resource.method} · ${resource.path}`,
    })),
  );

  readonly form = this.fb.group({
    role_id: [0, [Validators.required, Validators.min(1)]],
    resource_id: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    effect(() => {
      this.resetKey();
      this.form.reset({
        role_id: 0,
        resource_id: 0,
      });
    });

    this.loadCatalogs();
  }

  loadCatalogs(): void {
    this.catalogLoading.set(true);
    this.catalogError.set(null);

    forkJoin({
      roles: this.roleApi.list(),
      resources: this.resourceApi.list(),
    }).subscribe({
      next: ({ roles, resources }) => {
        this.roles.set(
          roles.filter((role) => role.status === 'active'),
        );
        this.resources.set(
          resources.filter((resource) => resource.status === 'active'),
        );
        this.catalogLoading.set(false);
      },
      error: (error: unknown) => {
        this.roles.set([]);
        this.resources.set([]);
        this.catalogError.set(toApiMessage(error));
        this.catalogLoading.set(false);
      },
    });
  }

  submit(): void {
    if (
      this.saving() ||
      this.catalogLoading() ||
      this.roles().length === 0 ||
      this.resources().length === 0
    ) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.saved.emit({
      role_id: value.role_id,
      resource_id: value.resource_id,
    });
  }
}
