import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface CreditI {
  id?: number;
  credit_application_id: number;
  rate_id: number;
  date: Date | string;
  approved_amount: number;
  term: number;
  interest_rate: number;
  status: "active" | "paid" | "cancelled";
  observations?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Credit extends Model {
  public id!: number;
  public credit_application_id!: number;
  public rate_id!: number;
  public date!: Date;
  public approved_amount!: number;
  public term!: number;
  public interest_rate!: number;
  public status!: "active" | "paid" | "cancelled";
  public observations!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Credit.init(
  {
    credit_application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rate_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    approved_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    term: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    interest_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "active",
        "paid",
        "cancelled"
      ),
      defaultValue: "active",
      allowNull: false,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Credit",
    tableName: "credits",
    timestamps: true,
  }
);
