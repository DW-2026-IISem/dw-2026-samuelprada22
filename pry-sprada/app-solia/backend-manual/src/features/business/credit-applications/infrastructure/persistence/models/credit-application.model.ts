import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Status } from '../../../../../../common/enums/status.enum.js';
import { MemberModel } from '../../../../members/infrastructure/persistence/models/member.model.js';

@Table({ tableName: 'credit_applications' })
export class CreditApplicationModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => MemberModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare memberId: number;

  @BelongsTo(() => MemberModel)
  declare member: MemberModel;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare date: Date;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  declare amount: number;

  @Column({
    type: DataType.ENUM(...Object.values(Status)),
    allowNull: false,
    defaultValue: Status.ACTIVE,
  })
  declare status: Status;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare observations: string | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
