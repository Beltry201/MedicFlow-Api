import { Patient } from "../models/patients.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const createPatient = async (req, res) => {
    try {
        // Extract patient data from the request body
        const {
            name,
            gender,
            birth_date,
            job,
            job_date,
            civil_status,
            phone_number,
            mail,
            medicalBackground_id,
            prescription_id,
            doctor_id,
        } = req.body;

        // Perform validation checks for required fields
        if (!name || !gender || !birth_date || !mail) {
            return res
                .status(400)
                .json({
                    error: "Name, gender, birth date, and email are required fields.",
                });
        }

        // Other validations can be added based on your business logic and requirements.

        // Create the patient record in the database using Sequelize
        const patient = await Patient.create({
            name,
            gender,
            birth_date,
            job,
            job_date,
            civil_status,
            phone_number,
            mail,
            medicalBackground_id,
            prescription_id,
            doctor_id,
        });

        // Return the newly created patient data as a response
        return res.status(201).json({ patient });
    } catch (error) {
        // Handle any unexpected errors
        console.error("Error creating patient:", error);
        return res
            .status(500)
            .json({ error: "An error occurred while creating the patient." });
    }
};
