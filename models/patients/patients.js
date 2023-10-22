import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { Consult } from "../consults/consults.js";
import { MediaFile } from "./media_files.js";
import { Note } from "./notes.js";

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
        last_name: {
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
            allowNull: true,
        },
        job_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        civil_status: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        mail: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        _id_doctor: {
            type: DataTypes.UUID,
            allowNull: false,
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

// ------------- MEDIA FILES -------------
MediaFile.belongsTo(Patient, {
    foreignKey: "_id_patient",
});
Patient.hasMany(MediaFile, {
    foreignKey: "_id_patient",
});

// ------------- NOTE -------------
Note.belongsTo(Patient, {
    foreignKey: "_id_patient",
});

Patient.hasMany(Note, {
    foreignKey: "_id_patient",
});
