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
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        tableName: "subscription_histories",
        timestamps: true,
    }
);

// Define associations
SubscriptionRecord.belongsTo(User, { foreignKey: "_id_user" });
SubscriptionRecord.belongsTo(MembershipPlan, {
    foreignKey: "_id_membership_plan",
});
