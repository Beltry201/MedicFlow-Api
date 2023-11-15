// models/subscriptions/payment_records.js

import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { MembershipPlan } from "./membership_plans.js";

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
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        payment_status: {
            type: DataTypes.ENUM("approved", "declined", "pending"),
            allowNull: false,
        },
        _id_membership_plan: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: MembershipPlan,
                key: "_id_membership_plan",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        discount_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.0,
        },
        discount_type: {
            type: DataTypes.ENUM("percentage", "fixed"),
            allowNull: true,
        },
    },
    {
        tableName: "payment_records",
        timestamps: true,
    }
);
