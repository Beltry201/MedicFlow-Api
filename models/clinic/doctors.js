import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const Doctor = sequelize.define(
    "Doctor",
    {
        _id_doctor: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        professional_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        department: {
            type: DataTypes.ENUM(
                "Cardiology",
                "Dermatology",
                "Orthopedics",
                "Oncology",
                "Other"
            ),
            allowNull: false,
        },
        specialty: {
            type: DataTypes.ENUM(
                "Pediatrics",
                "Neurology",
                "Internal Medicine",
                "Surgery",
                "Other"
            ),
            allowNull: false,
        },
    },
    {
        tableName: "doctors",
        timestamps: true,
        paranoid: true,
    }
);
