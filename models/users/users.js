import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";
import { PaymentMethod } from "../suscriptions/payment_methods.js";
import { Patient } from "./patients.js";
import { TreatmentCatalog } from "./treatments_catalogs.js";
import { Consult } from "../consults/consults.js";
import { ParameterType } from "../consults/parameter_types.js";
import { ConsultRating } from "../consults/consult_rating.js";
import { CalendarEvent } from "../users/calendar_events.js";

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

// Add the `comparePassword` method to the User model's prototype
User.prototype.comparePassword = function (password) {
    return this.password === password;
};

// ------------- PAYMENT METHOD -------------
User.hasMany(PaymentMethod, {
    foreignKey: "_id_doctor",
    sourceKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

PaymentMethod.belongsTo(User, {
    foreignKey: "_id_doctor",
    targetId: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
});

// ------------- PATIENT -------------
User.hasMany(Patient, {
    foreignKey: "_id_doctor",
    targetId: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
});

Patient.belongsTo(User, {
    foreignKey: "_id_doctor",
    targetId: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
});

// ------------- TREATMENT CATALOG -------------
User.hasMany(TreatmentCatalog, {
    foreignKey: "_id_doctor",
    targetId: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
});

TreatmentCatalog.belongsTo(User, {
    foreignKey: "_id_doctor",
    targetId: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
});

// ------------- CONSULT -------------
User.hasMany(Consult, {
    foreignKey: "_id_doctor",
    targetId: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
});

Consult.belongsTo(User, {
    foreignKey: "_id_doctor",
    targetId: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
});

// ------------- PARAMETERS -------------
User.hasMany(ParameterType, {
    foreignKey: "_id_doctor",
    targetId: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
});

ParameterType.belongsTo(User, {
    foreignKey: "_id_doctor",
    targetId: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
});

// ------------- CONSULT RATING -------------
User.hasMany(ConsultRating, {
    foreignKey: "_id_doctor",
    targetId: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
});

ConsultRating.belongsTo(User, {
    foreignKey: "_id_doctor",
    targetId: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
});

// ------------- CALENDAR EVENT -------------
User.hasMany(CalendarEvent, {
    foreignKey: "_id_doctor",
    targetId: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
});

CalendarEvent.belongsTo(User, {
    foreignKey: "_id_doctor",
    targetId: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
});