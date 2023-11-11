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
        plan_name: {
            type: DataTypes.STRING(),
            allowNull: false,
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
            type: DataTypes.ENUM("approved, declined, pending"),
            allowNull: false,
        },
    },
    {
        tableName: "payment_records",
        timestamps: true,
    }
);
