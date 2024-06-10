import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const Consult = sequelize.define(
    "Consult",
    {
        _id_consult: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        audio_transcript: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        audio_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        consult_json: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: "consults",
        timestamps: true,
        paranoid: true,
    }
);
