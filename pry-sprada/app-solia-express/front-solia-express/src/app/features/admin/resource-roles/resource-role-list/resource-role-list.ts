import { FormsModule } from '@angular/forms';
import { Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { Resource } from '../../../../core/models/resource.model';
import { Role } from '../../../../core/models/role.model';
import { ResourceRole } from '../../../../core/models/resource-role.model';
import { NotificationService } from '../../../../core/services/notification';
import { toApiMessage } from '../../../../core/utils/api-error';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { ResourceApi } from '../../resources/resource-api';
import { RoleApi } from '../../roles/role-api';
import { ResourceRoleApi } from '../resource-role-api';

type OperationCode = 'C' | 'R' | 'U' | 'D';

interface PermissionOperation {
  code: OperationCode;
  label: string;
  resourceIds: number[];
}

interface PermissionGroup {
  key: string;
  label: string;
  operations: PermissionOperation[];
}

@Component({
  host: { class: 'block' },
  selector: 'app-resource-role-list',
  imports: [
    FormsModule,
    ButtonModule,
    HasPermissionDirective,
    MessageModule,
    PageHeader,
    SelectModule,
  ],
  templateUrl: './resource-role-list.html',
})
export class ResourceRoleList {
  private readonly roleApi = inject(RoleApi);
  private readonly resourceApi = inject(ResourceApi);
  private readonly grantApi = inject(ResourceRoleApi);
  private readonly notify = inject(NotificationService);

  readonly roles = signal<Role[]>([]);
  readonly resources = signal<Resource[]>([]);
  readonly grants = signal<ResourceRole[]>([]);
  readonly selectedRoleId = signal<number | null>(null);
  readonly selectedResourceIds = signal<number[]>([]);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly selectedRole = computed(() =>
    this.roles().find((role) => role.id === this.selectedRoleId()) ?? null,
  );

  readonly groups = computed(() => this.buildGroups(this.resources()));

  private readonly matrixResourceIds = computed(() =>
    this.groups().flatMap((group) =>
      group.operations.flatMap((operation) => operation.resourceIds),
    ),
  );

  private readonly specialResourceIds = computed(() => {
    const roleId = this.selectedRoleId();
    if (roleId === null) return [];

    const matrixIds = new Set(this.matrixResourceIds());

    return this.grants()
      .filter((grant) =>
        grant.role_id === roleId &&
        grant.status === 'active' &&
        !matrixIds.has(grant.resource_id),
      )
      .map((grant) => grant.resource_id);
  });

  readonly selectedCount = computed(() => this.selectedResourceIds().length);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      roles: this.roleApi.list(),
      resources: this.resourceApi.list(),
      grants: this.grantApi.list(),
    }).subscribe({
      next: ({ roles, resources, grants }) => {
        const activeRoles = roles.filter((role) => role.status === 'active');
        const activeResources = resources.filter(
          (resource) => resource.status === 'active',
        );
        const activeGrants = grants.filter(
          (grant) => grant.status === 'active',
        );

        this.roles.set(activeRoles);
        this.resources.set(activeResources);
        this.grants.set(activeGrants);

        const currentId = this.selectedRoleId();
        const roleId = activeRoles.some((role) => role.id === currentId)
          ? currentId
          : (activeRoles[0]?.id ?? null);

        this.selectedRoleId.set(roleId);
        this.loadRolePermissions(roleId);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.roles.set([]);
        this.resources.set([]);
        this.grants.set([]);
        this.selectedResourceIds.set([]);
        this.error.set(toApiMessage(error));
        this.loading.set(false);
      },
    });
  }

  onRoleChange(roleId: number | null): void {
    this.selectedRoleId.set(roleId);
    this.loadRolePermissions(roleId);
  }

  private loadRolePermissions(roleId: number | null): void {
    if (roleId === null) {
      this.selectedResourceIds.set([]);
      return;
    }

    const grantedIds = this.grants()
      .filter((grant) =>
        grant.role_id === roleId && grant.status === 'active',
      )
      .map((grant) => grant.resource_id);

    const matrixIds = new Set(this.matrixResourceIds());

    this.selectedResourceIds.set(
      grantedIds.filter((id) => matrixIds.has(id)),
    );
  }

  isOperationSelected(operation: PermissionOperation): boolean {
    const selected = new Set(this.selectedResourceIds());

    return operation.resourceIds.length > 0 &&
      operation.resourceIds.every((id) => selected.has(id));
  }

  toggleOperation(operation: PermissionOperation, checked: boolean): void {
    const selected = new Set(this.selectedResourceIds());

    for (const id of operation.resourceIds) {
      if (checked) {
        selected.add(id);
      } else {
        selected.delete(id);
      }
    }

    this.selectedResourceIds.set([...selected]);
  }

  markAll(): void {
    this.selectedResourceIds.set(this.matrixResourceIds());
  }

  clearAll(): void {
    this.selectedResourceIds.set([]);
  }

  save(): void {
    const roleId = this.selectedRoleId();

    if (roleId === null || this.saving()) return;

    this.saving.set(true);

    const resourceIds = [
      ...new Set([
        ...this.selectedResourceIds(),
        ...this.specialResourceIds(),
      ]),
    ];

    this.grantApi.reconcile(roleId, resourceIds).subscribe({
      next: () => {
        this.saving.set(false);
        this.notify.success('Permisos del rol guardados correctamente');
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notify.error(
          'No se pudieron guardar los permisos',
          toApiMessage(error),
        );
      },
    });
  }

  private buildGroups(resources: Resource[]): PermissionGroup[] {
    const entities = new Map<string, Map<OperationCode, number[]>>();

    for (const resource of resources) {
      const path = resource.path.replace(/\/$/, '');
      let entity: string | null = null;
      let operation: OperationCode | null = null;

      const collection = path.match(/^\/api\/([^/]+)$/);
      const item = path.match(/^\/api\/([^/]+)\/:id$/);

      if (collection) {
        entity = collection[1];

        if (resource.method === 'POST') operation = 'C';
        if (resource.method === 'GET') operation = 'R';
      } else if (item) {
        entity = item[1];

        if (resource.method === 'GET') operation = 'R';
        if (resource.method === 'PUT' || resource.method === 'PATCH') {
          operation = 'U';
        }
        if (resource.method === 'DELETE') operation = 'D';
      }

      if (!entity || !operation) continue;

      if (!entities.has(entity)) {
        entities.set(entity, new Map());
      }

      const operations = entities.get(entity)!;
      const ids = operations.get(operation) ?? [];
      ids.push(resource.id);
      operations.set(operation, ids);
    }

    const definitions: {
      code: OperationCode;
      label: string;
    }[] = [
      { code: 'C', label: 'Crear' },
      { code: 'R', label: 'Leer' },
      { code: 'U', label: 'Actualizar' },
      { code: 'D', label: 'Eliminar' },
    ];

    return [...entities.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([entity, operations]) => ({
        key: entity,
        label: entity
          .split('-')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' '),
        operations: definitions
          .filter((definition) => (operations.get(definition.code) ?? []).length)
          .map((definition) => ({
            ...definition,
            resourceIds: operations.get(definition.code) ?? [],
          })),
      }));
  }
}
