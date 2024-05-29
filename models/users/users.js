import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import bcrypt from "bcrypt";

export const User = sequelize.define(
    "User",
    {
        _id_user: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        last_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
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
        profile_picture_url: {
            type: DataTypes.STRING(255),
        },
        pass_token: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("doctor", "admin", "staff"),
            allowNull: false,
        },
    },
    {
        tableName: "users",
        timestamps: true,
        paranoid: true,
    }
);

User.prototype.comparePassword = function (password) {
    return bcrypt.compare(password, this.pass_token);
};
