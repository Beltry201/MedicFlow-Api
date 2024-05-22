import Joi from "joi";
import dotenv from "dotenv";
import { Patient } from "../../models/patients/patients.js";

dotenv.config();

export class PatientService {
    async createPatient(userData, _id_doctor) {
        try {
            const {
                name,
                last_name,
                gender,
                birth_date,
                occupation,
                civil_status,
                phone_number,
                mail,
            } = userData;
            userData._id_doctor = _id_doctor;
            // Validations
            const schema = Joi.object({
                name: Joi.string().required(),
                last_name: Joi.string().required(),
                gender: Joi.string()
                    .valid("male", "female", "non-binary", "other")
                    .required(),
                birth_date: Joi.date().required(),
                occupation: Joi.string().allow(null, ""),
                civil_status: Joi.string().allow(null, ""),
                phone_number: Joi.string().required(),
                mail: Joi.string().email().allow(null, ""),
                _id_doctor: Joi.string().uuid().required(),
            });

            const { error } = schema.validate(userData);

            if (error) {
                throw new Error(error.details[0].message);
            }

            // Create the patient
            const newPatient = await Patient.create({
                name,
                last_name,
                gender,
                birth_date,
                occupation,
                civil_status,
                phone_number,
                mail,
                _id_doctor,
            });
            return newPatient;
        } catch (error) {
            console.error(error);
            throw new Error("Failed to create patient");
        }
    }
}
