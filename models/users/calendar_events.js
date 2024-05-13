import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const CalendarEvent = sequelize.define(
    "CalendarEvent",
    {
        _id_calendar_event: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        tableName: "calendar_events",
        timestamps: true,
        paranoid: true,
    }
);
