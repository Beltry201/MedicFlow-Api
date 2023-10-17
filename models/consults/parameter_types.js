import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

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
            type: DataTypes.ENUM("soap", "background"),
            allowNull: false,
        },
        category: {
            type: DataTypes.ENUM("AHF", "APNP", "APP", "AGO", "SOAP"),
            allowNull: false,
        },
        _id_doctor: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        tableName: "parameters_types",
        timestamps: true,
    }
);
