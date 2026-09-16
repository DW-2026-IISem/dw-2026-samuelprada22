import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Status } from '../../../../../../common/enums/status.enum';
import { UserModel } from '../../../../users/infrastructure/persistence/models/user.model';
import { RoleModel } from '../../../../roles/infrastructure/persistence/models/role.model';

@Table({ tableName: 'role_users' })
export class RoleUserModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => RoleModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare roleId: number;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @Column({
    type: DataType.ENUM(...Object.values(Status)),
    allowNull: false,
    defaultValue: Status.ACTIVE,
  })
  declare isActive: Status;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BelongsTo(() => RoleModel)
  declare role: RoleModel;

  @BelongsTo(() => UserModel)
  declare user: UserModel;
}
