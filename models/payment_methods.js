import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./users.js";

export const PaymentMethod = sequelize.define(
    "PaymentMethod",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        card_number: {
            type: DataTypes.STRING(16),
        },
        card_holder: {
            type: DataTypes.STRING(255),
        },
        expiration_date: {
            type: DataTypes.DATE,
        },
        cvv: {
            type: DataTypes.STRING(4),
        },
    },
    {
        tableName: "payment_methods",
        timestamps: true, // Set this to true if you want Sequelize to handle timestamps automatically
    }
);
