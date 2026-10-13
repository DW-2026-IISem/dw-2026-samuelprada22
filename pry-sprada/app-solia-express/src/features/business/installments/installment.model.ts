import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface InstallmentI {
  id?: number;
  credit_id: number;
  number: number;
  due_date: Date | string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  paid_amount: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

export class Installment extends Model {
  public id!: number;
  public credit_id!: number;
  public number!: number;
  public due_date!: Date;
  public principal_amount!: number;
  public interest_amount!: number;
  public total_amount!: number;
  public paid_amount!: number;
  public status!: "pending" | "paid" | "overdue" | "cancelled";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Installment.init(
  {
    credit_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    principal_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    interest_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    paid_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "paid",
        "overdue",
        "cancelled"
      ),
      defaultValue: "pending",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Installment",
    tableName: "installments",
    timestamps: true,
  }
);
