import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface MovementI {
  id?: number;
  account_id: number;
  reference_id?: number | null;
  type: string;
  date: Date;
  amount: number;
  observations?: string | null;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Movement extends Model {
  public id!: number;
  public account_id!: number;
  public reference_id!: number | null;
  public type!: string;
  public date!: Date;
  public amount!: number;
  public observations!: string | null;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Movement.init(
  {
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Movement",
    tableName: "movements",
    timestamps: true,
  }
);
