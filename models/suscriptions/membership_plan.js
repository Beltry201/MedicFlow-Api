import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const MembershipPlan = sequelize.define(
    "MembershipPlan",
    {
        _id_membership_plan: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        plan_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        billing_cycle: {
            type: DataTypes.ENUM("monthly", "yearly"),
            allowNull: false,
        },
        tokens_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "membership_plans",
        timestamps: false, // Assuming membership plans don't need timestamps
    }
);
