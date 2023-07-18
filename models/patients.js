import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./users.js";

export const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'non-binary', 'other'),
    allowNull: false
  },
  birth_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  job: {
    type: DataTypes.STRING(255)
  },
  job_date: {
    type: DataTypes.DATE
  },
  civil_status: {
    type: DataTypes.STRING(50)
  },
  phone_number: {
    type: DataTypes.STRING(20)
  },
  mail: {
    type: DataTypes.STRING(255)
  },
  is_valid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  medicalBackground_id: {
    type: DataTypes.INTEGER
    // You can add a foreign key constraint here if necessary
  },
  prescription_id: {
    type: DataTypes.INTEGER
    // You can add a foreign key constraint here if necessary
  },
  doctor_id: {
    type: DataTypes.INTEGER
    // You can add a foreign key constraint here if necessary
  }
}, {
  tableName: 'patients',
  timestamps: false // Set this to true if you want Sequelize to handle timestamps automatically
});