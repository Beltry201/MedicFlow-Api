import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const User = sequelize.define(
    "User",
    {
        _id_user: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        _id_folder: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        diploma_organization: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        office_address: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
        },
        profesional_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        profile_picture: {
            type: DataTypes.STRING(255),
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        specialty: {
            type: DataTypes.STRING(255),
        },
        role: {
            type: DataTypes.ENUM("doctor", "admin", "staff", "patient"),
            allowNull: false,
        },
        access_code: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true, // Set a default value of true for new users
        },
    },
    {
        tableName: "users",
        timestamps: true,
    }
);

User.prototype.comparePassword = function (password) {
    return this.password === password;
};
