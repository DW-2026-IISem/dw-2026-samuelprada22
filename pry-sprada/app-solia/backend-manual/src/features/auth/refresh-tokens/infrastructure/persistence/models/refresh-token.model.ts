import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
} from 'sequelize-typescript';

import { Status } from '../../../../../../common/enums/status.enum.js';
import { UserModel } from '../../../../users/infrastructure/persistence/models/user.model.js';

@Table({ tableName: 'refresh_tokens' })
export class RefreshTokenModel extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  declare token: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare deviceInfo: string | null;

  @Column({
    type: DataType.ENUM(...Object.values(Status)),
    allowNull: false,
    defaultValue: Status.ACTIVE,
  })
  declare isValid: Status;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare expiresAt: Date;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
