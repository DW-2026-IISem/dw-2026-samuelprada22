import {
  CreateResourceRoleDto,
  EffectivePermissionDto,
  ListResourceRolesDto,
  ResourceRoleResponseDto,
  toResourceRoleResponse,
} from "./dto";
import { ResourceRolesRepository } from "./resource-roles.repository";
import { ResourceRole } from "./resource-role.model";
import { RolesRepository } from "../roles/roles.repository";
import { ResourcesRepository } from "../resources/resources.repository";
import { AppError } from "../../../shared/errors/app-error";
import { withTransaction } from "../../../shared/database/with-transaction";

export interface ReconcileResult {
  role_id: number;
  activated: number;
  deactivated: number;
  total_active: number;
}

export class ResourceRolesService {
  public constructor(
    private readonly repository: ResourceRolesRepository = new ResourceRolesRepository(),
    private readonly rolesRepository: RolesRepository = new RolesRepository(),
    private readonly resourcesRepository: ResourcesRepository = new ResourcesRepository()
  ) {}

  // ================== READ ==================

  public async getAll(
    filters: ListResourceRolesDto = {}
  ): Promise<ResourceRoleResponseDto[]> {
    const grants = await this.repository.findAllActiveFiltered({
      role_id: filters.role_id,
      resource_id: filters.resource_id,
    });

    return grants.map((grant) => toResourceRoleResponse(grant));
  }

  public async getOne(id: number): Promise<ResourceRoleResponseDto> {
    return toResourceRoleResponse(await this.findOrFail(id));
  }

  public async findEffectiveForUser(
    userId: number
  ): Promise<EffectivePermissionDto[]> {
    return this.repository.findEffectiveForUser(userId);
  }

  // ================== CREATE ==================

  public async grant(
    body: CreateResourceRoleDto
  ): Promise<ResourceRoleResponseDto> {
    if (!body.role_id || !body.resource_id) {
      throw new AppError(400, "role_id and resource_id are required");
    }

    const role = await this.rolesRepository.findById(body.role_id);

    if (!role || role.status !== "active") {
      throw new AppError(404, "Role not found or inactive");
    }

    const resource = await this.resourcesRepository.findById(
      body.resource_id
    );

    if (!resource || resource.status !== "active") {
      throw new AppError(404, "Resource not found or inactive");
    }

    const existing = await this.repository.findByRoleAndResource(
      body.role_id,
      body.resource_id
    );

    if (existing) {
      if (existing.status === "active") {
        throw new AppError(
          409,
          "Role already has this resource granted"
        );
      }

      const reactivated = await this.repository.update(existing, {
        status: "active",
      });

      return toResourceRoleResponse(
        await this.reload(reactivated.id)
      );
    }

    const created = await this.repository.create({
      role_id: body.role_id,
      resource_id: body.resource_id,
      status: "active",
    });

    return toResourceRoleResponse(
      await this.reload(created.id)
    );
  }

  // ================== STATE ==================

  public async deactivate(
    id: number
  ): Promise<ResourceRoleResponseDto> {
    const grant = await this.findOrFail(id);

    await this.repository.update(grant, {
      status: "inactive",
    });

    return toResourceRoleResponse(
      await this.reload(grant.id)
    );
  }

  public async reactivate(
    id: number
  ): Promise<ResourceRoleResponseDto> {
    const grant = await this.findOrFail(id, false);

    if (grant.status === "active") {
      throw new AppError(409, "Grant is already active");
    }

    await this.repository.update(grant, {
      status: "active",
    });

    return toResourceRoleResponse(
      await this.reload(grant.id)
    );
  }

  // ================== RECONCILIATION ==================

  public async reconcileRole(
    roleId: number,
    resourceIds: number[]
  ): Promise<ReconcileResult> {
    const role = await this.rolesRepository.findById(roleId);

    if (!role) {
      throw new AppError(404, "Role not found");
    }

    const wanted = new Set(resourceIds);

    return withTransaction(async (t) => {
      const existing = await this.repository.findAllByRole(
        roleId,
        t
      );

      const byResource = new Map(
        existing.map((row) => [row.resource_id, row])
      );

      let activated = 0;
      let deactivated = 0;

      for (const resourceId of wanted) {
        const row = byResource.get(resourceId);

        if (!row) {
          await this.repository.create(
            {
              role_id: roleId,
              resource_id: resourceId,
              status: "active",
            },
            t
          );

          activated++;
          continue;
        }

        if (row.status !== "active") {
          await this.repository.update(
            row,
            { status: "active" },
            t
          );

          activated++;
        }
      }

      for (const row of existing) {
        if (wanted.has(row.resource_id)) {
          continue;
        }

        if (row.status === "active") {
          await this.repository.update(
            row,
            { status: "inactive" },
            t
          );

          deactivated++;
        }
      }

      return {
        role_id: roleId,
        activated,
        deactivated,
        total_active: wanted.size,
      };
    });
  }

  // ================== HELPERS ==================

  private async findOrFail(
    id: number,
    onlyActive = true
  ): Promise<ResourceRole> {
    const grant = await this.repository.findById(id);

    if (
      !grant ||
      (onlyActive && grant.status !== "active")
    ) {
      throw new AppError(404, "Grant not found");
    }

    return grant;
  }

  private async reload(id: number): Promise<ResourceRole> {
    const grant = await this.repository.findById(id);

    if (!grant) {
      throw new AppError(404, "Grant not found");
    }

    return grant;
  }
}
