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
        audio_transcript: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        consult_json: {
            type: DataTypes.JSON,
            allowNull: false,
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
