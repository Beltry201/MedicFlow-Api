import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const MediaFile = sequelize.define(
    "MediaFile",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        _id_patient: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        _id_consult: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "media_files",
        timestamps: true,
    }
);
