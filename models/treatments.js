import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { ParameterType } from "./parameter_types.js";
import { SubParameterType } from "./subparameters_types.js";

export const Treatment = sequelize.define(
    "Treatment",
    {
        _id_treatment: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        _id_consult: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        _id_media: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        _id_parameter: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "treatments",
        timestamps: true,
    }
);

// ------------- PARAMETER_TYPES -------------
Treatment.belongsTo(ParameterType, {
    foreignKey: "_id_parameter",
});

ParameterType.hasMany(Treatment, {
    foreignKey: "_id_parameter",
});