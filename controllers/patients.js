import { Patient } from "../models/patients.js";

// Create a new patient
export const createPatient = async (req, res) => {
    try {
        const {
            is_valid,
            name,
            last_name,
            gender,
            birth_date,
            phone_number,
            _id_doctor,
        } = req.body;

        // Create the patient in the database
        const newPatient = await Patient.create({
            is_valid,
            name,
            last_name,
            gender,
            birth_date,
            phone_number,
            _id_doctor,
        });

        res.status(201).json({ success: true, patient: newPatient });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to create patient",
            error: error.message,
        });
    }
};

// Get a list of all patients
export const listPatients = async (req, res) => {
    try {
        // Retrieve all patients from the database
        const patients = await Patient.findAll();

        res.status(200).json({ success: true, patients: patients || [] }); // Return an empty list if patients is falsy
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve patients",
            error: error.message,
        });
    }
};

// Get the details of a specific patient by ID
export const getPatientDetails = async (req, res) => {
    try {
        const patientId = req.params.id;

        // Find the patient by ID
        const patient = await Patient.findByPk(patientId);

        if (!patient) {
            return res
                .status(404)
                .json({ success: false, message: "Patient not found" });
        }

        if (!patient.is_valid) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid patient" });
        }

        res.status(200).json({ success: true, patient });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to get patient details",
            error: error.message,
        });
    }
};

// Update a patient by ID
export const updatePatient = async (req, res) => {
    try {
        const patientId = req.params.id;
        const {
            name,
            gender,
            birth_date,
            job,
            job_date,
            civil_status,
            phone_number,
            mail,
            _id_doctor,
        } = req.body;

        // Find the patient by ID
        const patient = await Patient.findByPk(patientId);

        if (!patient) {
            return res
                .status(404)
                .json({ success: false, message: "Patient not found" });
        }

        if (!patient.is_valid) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid patient" });
        }

        // Update the patient in the database
        await patient.update({
            name,
            gender,
            birth_date,
            job,
            job_date,
            civil_status,
            phone_number,
            mail,
            _id_doctor,
        });

        res.status(200).json({
            success: true,
            message: "Patient updated successfully",
            patient,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update patient",
            error: error.message,
        });
    }
};

// Delete a patient by ID
export const deletePatient = async (req, res) => {
    try {
        const patientId = req.params.id;

        // Find the patient by ID
        const patient = await Patient.findByPk(patientId);

        if (!patient) {
            return res
                .status(404)
                .json({ success: false, message: "Patient not found" });
        }

        if (!patient.is_valid) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid patient" });
        }

        // Deactivate the patient
        await patient.update({
            is_valid: false,
        });

        res.status(200).json({
            success: true,
            message: "Patient deactivated successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to deactivate patient",
            error: error.message,
        });
    }
};

export const getDoctorPatients = async (req, res) => {
    try {
        const doctorId = req.params.doctorId; // Assuming you are passing the doctor's ID as a URL parameter (e.g., /patients/doctor/:doctorId)

        // Find all patients for the given doctor ID
        const patients = await Patient.findAll({
            where: {
                _id_doctor: doctorId,
                is_valid: true,
            },
        });

        if (patients.length === 0) {
            return res
                .status(200)
                .json({
                    success: false,
                    message: "No patients found!",
                    patients: patients,
                });
        }

        res.status(200).json({ success: true, patients: patients });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to get doctor patients",
            error: error.message,
        });
    }
};
