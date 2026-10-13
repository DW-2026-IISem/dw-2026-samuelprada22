import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface InstallmentPaymentI {
  id?: number;
  installment_id: number;
  payment_date: Date | string;
  amount: number;
  reference?: string | null;
  method: "cash" | "transfer" | "deposit" | "other";
  status: "active" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

export class InstallmentPayment extends Model {
  public id!: number;
  public installment_id!: number;
  public payment_date!: Date;
  public amount!: number;
  public reference!: string | null;
  public method!: "cash" | "transfer" | "deposit" | "other";
  public status!: "active" | "cancelled";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InstallmentPayment.init(
  {
    installment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    method: {
      type: DataTypes.ENUM(
        "cash",
        "transfer",
        "deposit",
        "other"
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "active",
        "cancelled"
      ),
      defaultValue: "active",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "InstallmentPayment",
    tableName: "installment_payments",
    timestamps: true,
  }
);
