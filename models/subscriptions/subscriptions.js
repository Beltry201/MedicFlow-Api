import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const SubscriptionRecord = sequelize.define(
    "SubscriptionRecord",
    {
        _id_subscription_record: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        subscription_start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        subscription_end_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        state: {
            type: DataTypes.ENUM(
                "active",
                "pending",
                "trial",
                "cancelled",
                "suspended",
                "expired",
                "grace period",
                "pending cancellation",
                "free tier"
            ),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        _id_membership_plan: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "subscription_records",
        timestamps: true,
        paranoid: true,
    }
);
