import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Consult } from "./consults.js";
import { ParameterType } from "./parameter_types.js";

export const Background = sequelize.define(
    "Background",
    {
        _id_background: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
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
            type: DataTypes.UUID,
            allowNull: false,
        },
        _id_parameter: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        tableName: "backgrounds",
        timestamps: true,
    }
);

// ------------- PARAMETER_TYPES -------------
Background.belongsTo(ParameterType, {
    foreignKey: "_id_parameter",
});

ParameterType.hasMany(Background, {
    foreignKey: "_id_parameter",
});