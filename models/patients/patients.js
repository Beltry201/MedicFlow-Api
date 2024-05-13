import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const Patient = sequelize.define(
    "Patient",
    {
        _id_patient: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        gender: {
            type: DataTypes.ENUM("male", "female", "non-binary", "other"),
            allowNull: false,
        },
        birth_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        occupation: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        civil_status: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        mail: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: "patients",
        timestamps: true,
        paranoid: true,
    }
);
