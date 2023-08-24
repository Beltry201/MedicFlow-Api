import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Background } from "./backgrounds.js";
import { Treatment } from "./treatments.js";

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
        date: {
            type: DataTypes.DATE,
            allowNull: false,
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
            allowNull: false,
        },
    },
    {
        tableName: "consults",
        timestamps: true, // Set this to true if you want Sequelize to handle timestamps automatically
    }
);

// ------------- BACKGROUND -------------
Background.belongsTo(Consult, {
    foreignKey: "_id_consult",
});
Consult.hasMany(
    Background, { foreignKey: "_id_consult" });

// ------------- TREATMENT -------------
Treatment.belongsTo(Consult, {
    foreignKey: "_id_consult",
});
Consult.hasMany(
    Treatment, { foreignKey: "_id_consult" });
