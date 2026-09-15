import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { Status } from '../../../../../../common/enums/status.enum';

@Table({ tableName: 'roles' })
export class RoleModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  declare name: string;

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
}
