import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { PaymentMethod } from "./payment_methods.js";
import { Patient } from "./patients.js";
import { TreatmentCatalog } from "./treatments_catalogs.js";
import { Consult } from "./consults.js"
import { ParameterType } from "./parameter_types.js";

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
      access_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
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
  foreignKey: "_id_doctor",
  sourceKey: "_id_user",
  onDelete: "CASCADE", // Automatically delete related patients when the doctor is deleted
  onUpdate: "CASCADE"  // Update related doctor_id in patients if the doctor's id is updated
});

PaymentMethod.belongsTo(User, {
  foreignKey: "_id_doctor",
  targetId: "_id_user",
  onDelete: "CASCADE", // Automatically delete related patients when the doctor is deleted
  onUpdate: "CASCADE",  // Update related doctor_id in patients if the doctor's id is updated
  allowNull: false,
});


// ------------- PATIENT -------------
User.hasMany(Patient, {
  foreignKey: "_id_doctor",
  targetId: "_id_user",
  onDelete: "CASCADE", // Automatically delete related patients when the doctor is deleted
  onUpdate: "CASCADE",  // Update related doctor_id in patients if the doctor's id is updated
  allowNull: false,
});

Patient.belongsTo(User, {
  foreignKey: "_id_doctor",
  targetId: "_id_user",
  onDelete: "CASCADE", // Automatically delete related patients when the doctor is deleted
  onUpdate: "CASCADE",  // Update related doctor_id in patients if the doctor's id is updated
  allowNull: false,
});  

// ------------- TREATMENT CATALOG -------------
User.hasMany(TreatmentCatalog, {
  foreignKey: "_id_doctor",
  targetId: "_id_user",
  onDelete: "CASCADE", // Automatically delete related patients when the doctor is deleted
  onUpdate: "CASCADE",  // Update related doctor_id in patients if the doctor's id is updated
  allowNull: false,
});

TreatmentCatalog.belongsTo(User, {
  foreignKey: "_id_doctor",
  targetId: "_id_user",
  onDelete: "CASCADE", // Automatically delete related patients when the doctor is deleted
  onUpdate: "CASCADE",  // Update related doctor_id in patients if the doctor's id is updated
  allowNull: false,
});

// ------------- CONSULT -------------
User.hasMany(Consult, {
  foreignKey: "_id_doctor",
  targetId: "_id_user",
  onDelete: "CASCADE", // Automatically delete related patients when the doctor is deleted
  onUpdate: "CASCADE",  // Update related doctor_id in patients if the doctor's id is updated
  allowNull: false,
});

Consult.belongsTo(User, {
  foreignKey: "_id_doctor",
  targetId: "_id_user",
  onDelete: "CASCADE", // Automatically delete related patients when the doctor is deleted
  onUpdate: "CASCADE",  // Update related doctor_id in patients if the doctor's id is updated
  allowNull: false,
});

// ------------- PARAMETERS -------------
User.hasMany(ParameterType, {
  foreignKey: "_id_doctor",
  targetId: "_id_user",
  onDelete: "CASCADE", // Automatically delete related patients when the doctor is deleted
  onUpdate: "CASCADE",  // Update related doctor_id in patients if the doctor's id is updated
  allowNull: false,
});

ParameterType.belongsTo(User, {
  foreignKey: "_id_doctor",
  targetId: "_id_user",
  onDelete: "CASCADE", // Automatically delete related patients when the doctor is deleted
  onUpdate: "CASCADE",  // Update related doctor_id in patients if the doctor's id is updated
  allowNull: false,
}); 
