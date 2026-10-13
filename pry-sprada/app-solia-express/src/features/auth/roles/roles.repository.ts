import { CreationAttributes, Transaction } from "sequelize";
import { Role } from "./role.model";

/**
 * Capa Repository del feature Roles.
 * Única que habla con Sequelize (el modelo `Role`).
 */
export class RolesRepository {
  public async findAllActive(): Promise<Role[]> {
    return Role.findAll({ where: { status: "active" } });
  }

  public async findById(id: number, transaction?: Transaction): Promise<Role | null> {
    return Role.findByPk(id, { transaction });
  }

  public async findByName(name: string): Promise<Role | null> {
    return Role.findOne({
      where: { name: name.trim().toUpperCase() },
    });
  }

  public async create(data: CreationAttributes<Role>): Promise<Role> {
    return Role.create(data);
  }

  public async update(role: Role, data: Partial<Role>): Promise<Role> {
    return role.update(data);
  }

  public async delete(role: Role): Promise<void> {
    await role.destroy();
  }
}
