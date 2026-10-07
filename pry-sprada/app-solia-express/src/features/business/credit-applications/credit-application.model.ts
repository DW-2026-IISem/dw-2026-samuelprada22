import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface CreditApplicationI {
  id?: number;
  member_id: number;
  reference_id?: number | null;
  date: Date | string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  observations?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CreditApplication extends Model {
  public id!: number;
  public member_id!: number;
  public reference_id!: number | null;
  public date!: Date;
  public amount!: number;
  public status!: "pending" | "approved" | "rejected" | "cancelled";
  public observations!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CreditApplication.init(
  {
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "approved",
        "rejected",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "pending",
    },

    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "CreditApplication",
    tableName: "credit_applications",
    timestamps: true,
  }
);
