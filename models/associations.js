import { User } from "./users/users.js";
import { Note } from "./patients/notes.js";
import { Doctor } from "./clinic/doctors.js";
import { Patient } from "./patients/patients.js";
import { Consult } from "./consults/consults.js";
import { Template } from "./clinic/templates.js";
import { MediaFile } from "./patients/media_files.js";
import { CalendarEvent } from "./users/calendar_events.js";
import { ConsultRating } from "./consults/consult_rating.js";
import { SubscriptionRecord } from "./subscriptions/subscriptions.js";
import { MembershipPlan } from "./subscriptions/membership_plans.js";

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

// ------------- 1 USER 1 DOCTOR -------------
User.hasOne(Doctor, { foreignKey: "_id_user" });
Doctor.belongsTo(User, { foreignKey: "_id_user" });

// ------------- * CALENDAR EVENTS 1 DOCTOR -------------
Doctor.hasMany(CalendarEvent, { foreignKey: "_id_doctor" });
CalendarEvent.belongsTo(Doctor, { foreignKey: "_id_doctor" });

// ------------- * CALENDAR EVENTS 1 USER -------------
User.hasMany(CalendarEvent, { foreignKey: "_id_assistant" });
CalendarEvent.belongsTo(User, { foreignKey: "_id_assistant" });

// ------------- * CALENDAR EVENTS 1 PATIENT -------------
Patient.hasMany(CalendarEvent, { foreignKey: "_id_patient" });
CalendarEvent.belongsTo(Patient, { foreignKey: "_id_patient" });

// ------------- * CONSULTS 1 DOCTOR -------------
Doctor.hasMany(Consult, { foreignKey: "_id_doctor" });
Consult.belongsTo(User, { foreignKey: "_id_doctor" });

// ------------- * CONSULT 1 TEMPLATE -------------
Template.hasMany(Consult, { foreignKey: "_id_template" });
Consult.belongsTo(Template, { foreignKey: "_id_template" });

// ------------- 1 CONSULT 1 PATIENT -------------
Patient.hasMany(Consult, { foreignKey: "_id_patient" });
Consult.belongsTo(Patient, { foreignKey: "_id_patient" });

// ------------- 1 CONSULT 1 CONSULT RATING -------------
Consult.hasOne(ConsultRating, { foreignKey: "id_consult" });
ConsultRating.belongsTo(Consult, { foreignKey: "id_consult" });

// ------------- 1 MEMBERSHIP * SUBSCRIPTIONS -------------
SubscriptionRecord.belongsTo(MembershipPlan, {
    foreignKey: "_id_membership_plan",
    targetKey: "_id_membership_plan",
});

// ------------- 1 DOCTOR * SUBSCRIPTIONS -------------
Doctor.hasMany(SubscriptionRecord, {
    foreignKey: "_id_doctor",
});
SubscriptionRecord.belongsTo(Doctor, {
    foreignKey: "_id_doctor",
});

// ------------- 1 DOCTOR * PATIENTS -------------
Doctor.hasMany(Patient, {
    foreignKey: "_id_doctor",
});
Patient.belongsTo(Doctor, {
    foreignKey: "_id_doctor",
});

// ------------- 1 DOCTOR * TEMPLATES -------------
Doctor.hasMany(Template, {
    foreignKey: "_id_doctor",
});
Template.belongsTo(Doctor, {
    foreignKey: "_id_doctor",
});
