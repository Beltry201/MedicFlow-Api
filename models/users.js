import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { PaymentMethod } from "./payment_methods.js";

export const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
    },
    {
      tableName: "users",
      timestamps: true,
    }
  );
  
// Add the `comparePassword` method to the User model's prototype
User.prototype.comparePassword = function (password) {
    return this.password === password;
  };
  
User.hasMany(PaymentMethod, {
    foreignKey: "user_id",
    sourceKey: "id",
});

PaymentMethod.belongsTo(User, {
    foreignKey: "user_id",
    targetId: "id",
});
