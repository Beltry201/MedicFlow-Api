import { User } from "./users/users.js";
import { Note } from "./patients/notes.js";
import { Patient } from "./patients/patients.js";
import { Consult } from "./consults/consults.js";
import { MediaFile } from "./patients/media_files.js";
import { Background } from "./consults/backgrounds.js";
import { CalendarEvent } from "./users/calendar_events.js";
import { ConsultRating } from "./consults/consult_rating.js";
import { ParameterType } from "./consults/parameter_types.js";
import { Subscription } from "./subscriptions/subscriptions.js";
import { TreatmentCatalog } from "./users/treatments_catalogs.js";
import { PaymentRecord } from "./subscriptions/payment_records.js";
import { PaymentMethod } from "./subscriptions/payment_methods.js";
import { MembershipPlan } from "./subscriptions/membership_plans.js";

// ------------- 1 USER * PAYMENT METHOD -------------
// Each user can have multiple payment methods.
User.hasMany(PaymentMethod, {
    foreignKey: "_id_doctor",
    sourceKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each user (doctor) can have multiple payment methods.",
});

// Each payment method belongs to a single user (doctor).
PaymentMethod.belongsTo(User, {
    foreignKey: "_id_doctor",
    targetKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each payment method belongs to a single user (doctor).",
});

// ------------- 1 USER * PATIENT -------------
// Each user (doctor) can have multiple patients.
User.hasMany(Patient, {
    foreignKey: "_id_doctor",
    targetKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each user (doctor) can have multiple patients.",
});

// Each patient belongs to a single user (doctor).
Patient.belongsTo(User, {
    foreignKey: "_id_doctor",
    targetKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each patient belongs to a single user (doctor).",
});

// ------------- 1 USER * TREATMENT CATALOG -------------
// Each user (doctor) can have multiple entries in the treatment catalog.
User.hasMany(TreatmentCatalog, {
    foreignKey: "_id_doctor",
    targetKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description:
        "Each user (doctor) can have multiple entries in the treatment catalog.",
});

// Each entry in the treatment catalog belongs to a single user (doctor).
TreatmentCatalog.belongsTo(User, {
    foreignKey: "_id_doctor",
    targetKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description:
        "Each entry in the treatment catalog belongs to a single user (doctor).",
});

// ------------- 1 USER * CONSULT -------------
// Each user (doctor) can have multiple consultations.
User.hasMany(Consult, {
    foreignKey: "_id_doctor",
    targetKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each user (doctor) can have multiple consultations.",
});

// Each consultation belongs to a single user (doctor).
Consult.belongsTo(User, {
    foreignKey: "_id_doctor",
    targetKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each consultation belongs to a single user (doctor).",
});

// ------------- 1 USER * PARAMETER TYPE -------------
// Each user (doctor) can define multiple parameter types.
User.hasMany(ParameterType, {
    foreignKey: "_id_doctor",
    targetKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each user (doctor) can define multiple parameter types.",
});

// Each parameter type belongs to a single user (doctor).
ParameterType.belongsTo(User, {
    foreignKey: "_id_doctor",
    targetKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each parameter type belongs to a single user (doctor).",
});

// ------------- 1 USER * CONSULT RATING -------------
// Each user (doctor) can receive multiple consult ratings.
User.hasMany(ConsultRating, {
    foreignKey: "_id_doctor",
    targetKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each user (doctor) can receive multiple consult ratings.",
});

// Each consult rating belongs to a single user (doctor).
ConsultRating.belongsTo(User, {
    foreignKey: "_id_doctor",
    targetKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each consult rating belongs to a single user (doctor).",
});

// ------------- 1 USER * CALENDAR EVENT -------------
// Each user (doctor) can have multiple calendar events.
User.hasMany(CalendarEvent, {
    foreignKey: "_id_doctor",
    targetKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each user (doctor) can have multiple calendar events.",
});

// Each calendar event belongs to a single user (doctor).
CalendarEvent.belongsTo(User, {
    foreignKey: "_id_doctor",
    targetKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each calendar event belongs to a single user (doctor).",
});

// ------------- 1 BACKGROUND 1 PARAMETER_TYPES -------------
// Each background belongs to a specific parameter type.
Background.belongsTo(ParameterType, {
    foreignKey: "_id_parameter",
    onDelete: "CASCADE",
    description: "Each background belongs to a specific parameter type.",
});

ParameterType.hasMany(Background, {
    foreignKey: "_id_parameter",
    onDelete: "CASCADE",
    description: "Each parameter type can have multiple backgrounds.",
});

// ------------- 1 CONSULT * BACKGROUND -------------
// Each background belongs to a specific consult.
Background.belongsTo(Consult, {
    foreignKey: "_id_consult",
    onDelete: "CASCADE",
    description: "Each background belongs to a specific consult.",
});

Consult.hasMany(Background, {
    foreignKey: "_id_consult",
    onDelete: "CASCADE",
    description: "Each consult can have multiple backgrounds.",
});

// ------------- 1 CONSULT 1 CONSULT RATING -------------
// Each consult rating belongs to a specific consult.
ConsultRating.belongsTo(Consult, {
    foreignKey: "_id_consult",
    targetKey: "_id_consult",
    onDelete: "CASCADE",
    description: "Each consult rating belongs to a specific consult.",
});

Consult.hasOne(ConsultRating, {
    foreignKey: "_id_consult",
    targetKey: "_id_consult",
    onDelete: "CASCADE",
    description: "Each consult can have one consult ratings.",
});

// ------------- 1 TREATMENT CATALOG * CONSULT -------------
// Each consult is associated with a specific treatment catalog entry.
Consult.belongsTo(TreatmentCatalog, {
    foreignKey: "_id_treatment_catalog",
    targetKey: "_id_treatment_catalog",
    onDelete: "CASCADE",
    description:
        "Each consult is associated with a specific treatment catalog entry.",
});

TreatmentCatalog.hasMany(Consult, {
    foreignKey: "_id_treatment_catalog",
    sourceKey: "_id_treatment_catalog",
    onDelete: "CASCADE",
    description:
        "Each treatment catalog entry can be associated with multiple consults.",
});

// ------------- 1 CONSULT * MEDIA FILES -------------
// Each media file is associated with a specific consult.
MediaFile.belongsTo(Consult, {
    foreignKey: "_id_consult",
    targetKey: "_id_consult",
    onDelete: "CASCADE",
    description: "Each media file is associated with a specific consult.",
});

Consult.hasMany(MediaFile, {
    foreignKey: "_id_consult",
    sourceKey: "_id_consult",
    onDelete: "CASCADE",
    description: "Each consult can have multiple associated media files.",
});

// ------------- 1 PATIENT * CONSULT -------------
// Each consult is associated with a specific patient.
Consult.belongsTo(Patient, {
    foreignKey: "_id_patient",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
    description: "Each consult is associated with a specific patient.",
});

Patient.hasMany(Consult, {
    foreignKey: "_id_patient",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each patient can have multiple associated consults.",
});

// ------------- 1 PATIENT * MEDIA FILES -------------
// Each media file is associated with a specific patient.
MediaFile.belongsTo(Patient, {
    foreignKey: "_id_patient",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each media file is associated with a specific patient.",
});

Patient.hasMany(MediaFile, {
    foreignKey: "_id_patient",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each patient can have multiple associated media files.",
});

// ------------- 1 PATIENT * NOTE -------------
// Each note is associated with a specific patient.
Note.belongsTo(Patient, {
    foreignKey: "_id_patient",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each note is associated with a specific patient.",
});

Patient.hasMany(Note, {
    foreignKey: "_id_patient",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each patient can have multiple associated notes.",
});

// ------------- 1 SUBSCRIPTION 1 MEMBERSHIP PLAN -------------
// Each subscription belongs to a specific membership plan.
MembershipPlan.hasMany(Subscription, {
    foreignKey: "_id_membership_plan",
    targetKey: "_id_membership_plan",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
    description: "Each subscription belongs to a specific membership plan.",
});

Subscription.belongsTo(MembershipPlan, {
    foreignKey: "_id_membership_plan",
    targetKey: "_id_membership_plan",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    allowNull: false,
    description:
        "Each subscription is associated with a specific membership plan.",
});

// ------------- 1 USER * PAYMENT RECORD -------------
// Each payment record belongs to a specific user, payment method, and subscription.
PaymentRecord.belongsTo(User, { foreignKey: "_id_user", onDelete: "CASCADE" });

// ------------- 1 PAYMENT RECORD 1 PAYMENT MEHTOD -------------
PaymentRecord.belongsTo(PaymentMethod, {
    foreignKey: "_id_payment_method",
    onDelete: "CASCADE",
});

// ------------- 1 PAYMENT RECORD 1 SUBSCRIPTION -------------
PaymentRecord.belongsTo(Subscription, {
    foreignKey: "_id_subscription_record",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description:
        "Each payment record belongs to a specific user, payment method, and subscription.",
});

// ------------- 1 SUBSCRIPTION 1 USER -------------
// Each subscription belongs to a specific user.
Subscription.belongsTo(User, {
    foreignKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each subscription belongs to a specific user.",
});

User.hasMany(Subscription, {
    foreignKey: "_id_user",
    sourceKey: "_id_user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    description: "Each user can have multiple subscriptions.",
});
