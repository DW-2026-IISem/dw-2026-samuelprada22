import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../database/db";

export interface MemberI {
  id?: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Member extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Member.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Member name cannot be empty",
        },
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Member",
    tableName: "members",
    timestamps: true,
  }
);
