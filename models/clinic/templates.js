import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const Template = sequelize.define(
    "templates",
    {
        _id_template: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        prompt: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        template_json: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    },
    {
        tableName: "templates",
        timestamps: true,
        paranoid: true,
    }
);
