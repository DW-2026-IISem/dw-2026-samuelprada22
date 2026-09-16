import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { Status } from '../../../../../../common/enums/status.enum.js';

import { ResourceModel } from '../../../../resources/infrastructure/persistence/models/resource.model.js';
import { RoleModel } from '../../../../roles/infrastructure/persistence/models/role.model.js';

@Table({
  tableName: 'resource_roles',
})
export class ResourceRoleModel extends Model {
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => ResourceModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare resourceId: number;

  @ForeignKey(() => RoleModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare roleId: number;

  @Column({
    type: DataType.CHAR(1),
    allowNull: false,
    defaultValue: '1',
  })
  declare isActive: string;

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

  @BelongsTo(() => ResourceModel)
  declare resource: InstanceType<typeof ResourceModel>;

  @BelongsTo(() => RoleModel)
  declare role: InstanceType<typeof RoleModel>;
}
