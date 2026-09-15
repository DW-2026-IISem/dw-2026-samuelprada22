import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  BelongsToMany,
} from 'sequelize-typescript';

import { Status } from '../../../../../../common/enums/status.enum.js';

import { RoleModel } from '../../../../roles/infrastructure/persistence/models/role.model.js';
import { ResourceRoleModel } from '../../../../resource-roles/infrastructure/persistence/models/resource-role.model.js';

@Table({ tableName: 'resources' })
export class ResourceModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare path: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  declare method: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare isActive: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(Status)),
    allowNull: false,
    defaultValue: Status.ACTIVE,
  })
  declare status: Status;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BelongsToMany(
    () => RoleModel,
    () => ResourceRoleModel,
  )
  declare roles: RoleModel[];
}
