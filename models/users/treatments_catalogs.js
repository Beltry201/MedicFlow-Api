import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const TreatmentCatalog = sequelize.define(
    "TreatmentCatalog",
    {
        _id_treatment_catalog: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        duration_weeks: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        description: {
            type: DataTypes.TEXT,
        },
        _id_doctor: {
            type: DataTypes.UUID,
        },
        is_valud: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "treatments_catalog",
        timestamps: true,
    }
);
