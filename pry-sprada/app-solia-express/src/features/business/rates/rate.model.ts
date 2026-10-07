import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface RateI {
  id?: number;
  name: string;
  percentage: number;
  type: "monthly" | "annual";
  description?: string | null;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Rate extends Model {
  public id!: number;
  public name!: string;
  public percentage!: number;
  public type!: "monthly" | "annual";
  public description!: string | null;
  public status!: "active" | "inactive";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Rate.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("monthly", "annual"),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
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
    modelName: "Rate",
    tableName: "rates",
    timestamps: true,
  }
);
