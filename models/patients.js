import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Consult } from "./consults.js"

export const Patient = sequelize.define(
    "Patient",
    {
        _id_patient: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        gender: {
            type: DataTypes.ENUM("male", "female", "non-binary", "other"),
            allowNull: false,
        },
        birth_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        job: {
            type: DataTypes.STRING(255),
        },
        job_date: {
            type: DataTypes.DATE,
        },
        civil_status: {
            type: DataTypes.STRING(50),
        },
        phone_number: {
            type: DataTypes.STRING(20),
        },
        mail: {
            type: DataTypes.STRING(255),
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        _id_doctor: {
            type: DataTypes.UUID,
            // You can add a foreign key constraint here if necessary
        },
    },
    {
        tableName: "patients",
        timestamps: true, // Set this to true if you want Sequelize to handle timestamps automatically
    }
);

// ------------- CONSULT -------------

Consult.belongsTo(Patient, {
    foreignKey: "_id_patient", // The foreign key in the Consult table that refers to the Patient
    targetId: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
});

Patient.hasMany(Consult, {
    foreignKey: "_id_patient",
});