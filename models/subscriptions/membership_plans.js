import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { Subscription } from "./subscriptions.js";

export const MembershipPlan = sequelize.define(
    "MembershipPlan",
    {
        _id_membership_plan: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        plan_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        monthly_price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        billing_cycle: {
            type: DataTypes.ENUM("monthly", "yearly"),
            allowNull: false,
        },
        consults_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        min_per_consult: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "membership_plans",
        timestamps: true,
    }
);
