import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const PaymentMethod = sequelize.define(
    "PaymentMethod",
    {
        _id_payment_method: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        card_number: {
            type: DataTypes.STRING(16),
            allowNull: false,
        },
        card_holder: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        expiration_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        cvv: {
            type: DataTypes.STRING(4),
            allowNull: false,
        },
        _id_doctor: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        tableName: "payment_methods",
        timestamps: true,
    }
);
