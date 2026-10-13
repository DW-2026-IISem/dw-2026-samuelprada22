import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface AuditI {
  id?: number;
  actor_user_id: number;
  action: string;
  entity: string;
  entity_id: number;
  data?: string | null;
  createdAt?: Date;
}

export class Audit extends Model {
  public id!: number;
  public actor_user_id!: number;
  public action!: string;
  public entity!: string;
  public entity_id!: number;
  public data!: string | null;
  public readonly createdAt!: Date;
}

Audit.init(
  {
    actor_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Audit",
    tableName: "audits",
    timestamps: true,
    updatedAt: false,
  }
);
