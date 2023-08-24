import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const ParameterType = sequelize.define(
    "ParameterType",
    {
        _id_parameter_type: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        parameter_type_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        parameter_belongs_to: {
            type: DataTypes.ENUM("treatment", "background"),
            allowNull: false,
        },
        category: {
            type: DataTypes.ENUM("AHF", "APNP", "APP", "AGO", "EN", "DGN"),
            allowNull: false,
        },
        _id_doctor: {
            type: DataTypes.UUID,
            allowNull: false
        }

    },
    {
        tableName: "parameters_types",
        timestamps: true, // Set this to true if you want Sequelize to handle timestamps automatically
    }
);

