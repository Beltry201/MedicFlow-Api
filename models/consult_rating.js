import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const ConsultRating = sequelize.define(
    "ConsultRating",
    {
        _id_consult_rating: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        rating: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        attributes: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        _id_doctor: {
            type: DataTypes.UUID,
        },
        _id_consult: {
            type: DataTypes.UUID,
        },
    },
    {
        tableName: "consult_rating",
        timestamps: true,
    }
);
