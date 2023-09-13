import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { ParameterType } from "./parameter_types.js";

export const Note = sequelize.define(
    "Note",
    {
        _id_note: {
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
        _id_media: {
            type: DataTypes.UUID,
            allowNull: true
        },
        _id_parameter: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        tableName: "notes",
        timestamps: true,
    }
);

// ------------- PARAMETER_TYPES -------------
Note.belongsTo(ParameterType, {
    foreignKey: "_id_parameter",
});

ParameterType.hasMany(Note, {
    foreignKey: "_id_parameter",
});