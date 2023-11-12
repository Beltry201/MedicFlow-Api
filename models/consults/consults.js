import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const Consult = sequelize.define(
    "Consult",
    {
        _id_consult: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        audio_transcript: {
            type: DataTypes.STRING(10000),
            allowNull: false,
        },
        consult_json: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        treatment_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
        },
        treatment_price: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: null,
        },
        recording_duration_s: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: null,
        },
        whisper_version: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
        },
        completion_tokens: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        prompt_tokens: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        is_finished: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        _id_doctor: {
            type: DataTypes.UUID,
        },
        _id_patient: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        _id_treatment_catalog: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        tableName: "consults",
        timestamps: true,
    }
);
