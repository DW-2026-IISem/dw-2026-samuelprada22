import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'audits',
  timestamps: false,
})
export class AuditModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    field: 'actor_user_id',
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare actorUserId: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare accion: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare entidad: string;

  @Column({
    field: 'entidad_id',
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare entidadId: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare datos: string | null;

  @CreatedAt
  @Column({
    field: 'created_at',
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare createdAt: Date;
}
