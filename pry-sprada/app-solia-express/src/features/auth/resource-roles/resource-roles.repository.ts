import { CreationAttributes, Op, Transaction } from "sequelize";
import { ResourceRole } from "./resource-role.model";
import { Role } from "../roles/role.model";
import { Resource } from "../resources/resource.model";
import { RoleUser } from "../role-users/role-user.model";
import { EffectivePermissionDto } from "./dto";

const SUMMARIES = [
  { model: Role, as: "role", attributes: ["id", "name"] },
  {
    model: Resource,
    as: "resource",
    attributes: ["id", "method", "path", "description"],
  },
];

export class ResourceRolesRepository {
  public async findAllActive(): Promise<ResourceRole[]> {
    return ResourceRole.findAll({
      where: { status: "active" },
      include: SUMMARIES,
    });
  }

  public async findAllActiveFiltered(filters: {
    role_id?: number;
    resource_id?: number;
  }): Promise<ResourceRole[]> {
    const where: Record<string, unknown> = { status: "active" };

    if (filters.role_id) where.role_id = filters.role_id;
    if (filters.resource_id) where.resource_id = filters.resource_id;

    return ResourceRole.findAll({
      where,
      include: SUMMARIES,
      order: [["id", "ASC"]],
    });
  }

  public async findById(
    id: number,
    transaction?: Transaction
  ): Promise<ResourceRole | null> {
    return ResourceRole.findByPk(id, {
      include: SUMMARIES,
      transaction,
    });
  }

  public async findByRoleAndResource(
    roleId: number,
    resourceId: number
  ): Promise<ResourceRole | null> {
    return ResourceRole.findOne({
      where: {
        role_id: roleId,
        resource_id: resourceId,
      },
    });
  }

  public async findAllByRole(
    roleId: number,
    transaction?: Transaction
  ): Promise<ResourceRole[]> {
    return ResourceRole.findAll({
      where: { role_id: roleId },
      transaction,
    });
  }

  public async create(
    data: CreationAttributes<ResourceRole>,
    transaction?: Transaction
  ): Promise<ResourceRole> {
    return ResourceRole.create(data, { transaction });
  }

  public async update(
    resourceRole: ResourceRole,
    data: Partial<ResourceRole>,
    transaction?: Transaction
  ): Promise<ResourceRole> {
    return resourceRole.update(data, { transaction });
  }

  public async findEffectiveForUser(
    userId: number
  ): Promise<EffectivePermissionDto[]> {
    const rows = await ResourceRole.findAll({
      where: { status: "active" },
      attributes: ["id"],
      include: [
        {
          model: Role,
          as: "role",
          required: true,
          attributes: ["id", "name"],
          where: { status: "active" },
          include: [
            {
              model: RoleUser,
              as: "role_users",
              required: true,
              attributes: [],
              where: {
                status: "active",
                user_id: userId,
              },
            },
          ],
        },
        {
          model: Resource,
          as: "resource",
          required: true,
          attributes: [
            "id",
            "method",
            "path",
            "description",
          ],
          where: { status: "active" },
        },
      ],
      order: [["id", "ASC"]],
    });

    return rows.map((row) => {
      const plain = row.toJSON() as unknown as {
        role: {
          id: number;
          name: string;
        };
        resource: {
          id: number;
          method: string;
          path: string;
          description: string | null;
        };
      };

      return {
        resource_id: plain.resource.id,
        method: plain.resource.method,
        path: plain.resource.path,
        description: plain.resource.description,
        role_id: plain.role.id,
        role_name: plain.role.name,
      };
    });
  }

  public async countActiveByRole(roleId: number): Promise<number> {
    return ResourceRole.count({
      where: {
        role_id: roleId,
        status: "active",
      },
    });
  }

  public async countActive(): Promise<number> {
    return ResourceRole.count({
      where: { status: "active" },
    });
  }

  public async countActiveByResources(
    resourceIds: number[]
  ): Promise<number> {
    if (resourceIds.length === 0) return 0;

    return ResourceRole.count({
      where: {
        resource_id: {
          [Op.in]: resourceIds,
        },
        status: "active",
      },
    });
  }
}
