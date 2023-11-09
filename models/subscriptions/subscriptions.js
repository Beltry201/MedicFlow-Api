import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { User } from "../users/users.js";

export const Subscription = sequelize.define(
    "Subscriptions",
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
                "Active",
                "Pending",
                "Trial",
                "Cancelled",
                "Suspended",
                "Expired",
                "Grace Period",
                "Pending Cancellation",
                "Free Tier"
            ),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        tableName: "subscriptions",
        timestamps: true,
    }
);

// Define associations
Subscription.belongsTo(User, { foreignKey: "_id_user" });
