import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { PaymentMethod } from "./payment_methods.js";
import { Patient } from "./patients.js";

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


// Add the `comparePassword` method to the User model's prototype
User.prototype.comparePassword = function (password) {
    return this.password === password;
  };

// ------------- PAYMENT METHOD -------------
User.hasMany(PaymentMethod, {
    foreignKey: "user_id",
    sourceKey: "id",
    onDelete: "CASCADE", // Automatically delete related patients when the doctor is deleted
    onUpdate: "CASCADE"  // Update related doctor_id in patients if the doctor's id is updated
});

PaymentMethod.belongsTo(User, {
    foreignKey: "user_id",
    targetId: "id",
    onDelete: "CASCADE", // Automatically delete related patients when the doctor is deleted
    onUpdate: "CASCADE"  // Update related doctor_id in patients if the doctor's id is updated
});

// ------------- PATIENT -------------
Patient.belongsTo(User, {
  foreignKey: "doctor_id",
  targetKey: "id",
  onDelete: "CASCADE", // Automatically delete related patients when the doctor is deleted
  onUpdate: "CASCADE"  // Update related doctor_id in patients if the doctor's id is updated
});

User.hasMany(Patient, {
  foreignKey: "doctor_id",
  sourceKey: "id",
  onDelete: "CASCADE", // Automatically delete related patients when the user is deleted
  onUpdate: "CASCADE"  // Update related user_id in patients if the user's id is updated
});