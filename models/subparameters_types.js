import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Background } from "./backgrounds.js";

export const SubParameterType = sequelize.define(
    "SubParameterType",
    {
        _id_subparameter_type: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        subparameter_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "subparameters_types",
        timestamps: true,
    }
);


