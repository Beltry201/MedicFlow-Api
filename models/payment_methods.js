import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const PaymentMethod = sequelize.define(
    "PaymentMethod",
    {
        _id_payment_method: {
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
        _id_doctor: {
            type: DataTypes.INTEGER,
            // You can add a foreign key constraint here if necessary
        },
    },
    {
        tableName: "payment_methods",
        timestamps: true, // Set this to true if you want Sequelize to handle timestamps automatically
    }
);
