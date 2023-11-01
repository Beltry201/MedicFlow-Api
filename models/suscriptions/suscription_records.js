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
            type: Sequelize.ENUM(
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
        tableName: "subscription_records",
        timestamps: true,
    }
);

// Define associations
SubscriptionRecord.belongsTo(User, { foreignKey: "_id_user" });
SubscriptionRecord.belongsTo(MembershipPlan, {
    foreignKey: "_id_membership_plan",
});
