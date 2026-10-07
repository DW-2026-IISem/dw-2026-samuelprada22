import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface CommitteeDecisionI {
  id?: number;
  credit_application_id: number;
  decision: "pending" | "approved" | "rejected" | "observed";
  decision_date?: Date | string | null;
  comments?: string | null;
  decided_by?: number | null;
  status: "active" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

export class CommitteeDecision extends Model {
  public id!: number;
  public credit_application_id!: number;
  public decision!: "pending" | "approved" | "rejected" | "observed";
  public decision_date!: Date | null;
  public comments!: string | null;
  public decided_by!: number | null;
  public status!: "active" | "cancelled";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CommitteeDecision.init(
  {
    credit_application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    decision: {
      type: DataTypes.ENUM(
        "pending",
        "approved",
        "rejected",
        "observed"
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    decision_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    decided_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "cancelled"),
      defaultValue: "active",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "CommitteeDecision",
    tableName: "committee_decisions",
    timestamps: true,
  }
);
