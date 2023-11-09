import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { User } from "../users/users.js";
import { MembershipPlan } from "./membership_plans.js";
import { Subscription } from "./subscriptions.js";
import { PaymentMethod } from "./payment_methods.js";

export const PaymentRecord = sequelize.define(
    "PaymentRecord",
    {
        _id_payment_record: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        payment_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        payment_amount: {
            type: DataTypes.DECIMAL(10, 2), // Adjust precision and scale as needed
            allowNull: false,
        },
        payment_status: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        _id_membership_plan: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        tableName: "payment_records",
        timestamps: true,
    }
);

// Define associations
PaymentRecord.belongsTo(User, { foreignKey: "_id_user" });
PaymentRecord.belongsTo(PaymentMethod, { foreignKey: "_id_payment_method" });
PaymentRecord.belongsTo(Subscription, {
    foreignKey: "_id_subscription_record",
});
Subscription.belongsTo(MembershipPlan, {
    foreignKey: "_id_membership_plan",
});
