import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const Clinic = sequelize.define(
    "Clinic",
    {
        _id_clinic: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        logo_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "clinics",
        timestamps: true,
        paranoid: true,
    }
);
