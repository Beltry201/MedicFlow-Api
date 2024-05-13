import { similarityScore } from "../../helpers/string_similarity.js";
import { MediaFile } from "../../models/patients/media_files.js";
import { Patient } from "../../models/patients/patients.js";
import { Consult } from "../../models/consults/consults.js";
import { PatientService } from "../../services/patients/patients.js";
import { Op } from "sequelize";
import { sequelize } from "../../config/db.js";
const patientService = new PatientService();

// Create a new patient
export const createPatient = async (req, res) => {
    try {
        const userData = req.body;
        const newPatient = await patientService.createPatient(userData);

        res.status(201).json({
            success: true,
            message: "Patient created successfully",
            patient: newPatient,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Failed to create user",
            error: error.message,
        });
    }
};

// Get a list of all patients
export const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.findAll({
            include: [
                {
                    model: Consult,
                    order: [["createdAt", "DESC"]],
                    limit: 1,
                },
            ],
            attributes: {
                include: [
                    [
                        sequelize.cast(
                            sequelize.literal(
                                `(SELECT count(*) 
                                AS "count" FROM "consults" AS "Consult" 
                                WHERE ("Consult"."_id_patient" = "Patient"."_id_patient" 
                                AND "Consult"."deletedAt" IS NULL)
                                )`
                            ),
                            "INTEGER"
                        ),
                        "consultCount",
                    ],
                ],
            },
        });

        // Iterate over patients
        patients.forEach((patient) => {
            console.log(patient);
            patient.dataValues.last_consult = patient.Consults[0];
            delete patient.dataValues.Consults;
        });

        res.status(200).json({ success: true, patients: patients || [] });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve patients",
            error: error.message,
        });
    }
};

export const searchPatients = async (req, res) => {
    try {
        const searchText = req.query.searchText;
        console.log(searchText);
        // Define the search criteria
        const searchCriteria = {
            [Op.or]: [
                {
                    name: {
                        [Op.like]: `%${searchText}%`,
                    },
                },
                {
                    last_name: {
                        [Op.like]: `%${searchText}%`,
                    },
                },
                {
                    mail: {
                        [Op.like]: `%${searchText}%`,
                    },
                },
                // Add more search criteria as needed
            ],
        };

        // Perform the search
        const patients = await Patient.findAll({
            where: searchCriteria,
        });

        // Return the search results
        res.status(200).json({
            success: true,
            message: "Patients found successfully",
            patients: patients,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to search patients",
            error: error.message,
        });
    }
};

export const getPatientDetails = async (req, res) => {
    try {
        const patientId = req.query._id_patient;

        // Find the patient by ID
        const patient = await Patient.findByPk(patientId);

        if (!patient) {
            return res
                .status(404)
                .json({ success: false, message: "Patient not found" });
        }

        const consultCount = await Consult.count({
            where: {
                _id_patient: patientId,
            },
        });

        const patientDetails = {
            ...patient.toJSON(),
            consultCount,
        };

        res.status(200).json({ success: true, patient: patientDetails });
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
        const patientId = req.query._id_patient;
        const {
            name,
            gender,
            birth_date,
            job,
            job_date,
            civil_status,
            phone_number,
            mail,
        } = req.body; // Remove _id_doctor from the destructuring

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
        const patientId = req.query._id_pacient;

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
        const _id_doctor = req.user._id_user;

        // Find all patients for the given doctor ID
        const patients = await Patient.findAll({
            where: {
                _id_doctor,
                is_valid: true,
            },
        });

        if (patients.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No patients found!",
                patients: patients,
            });
        }

        // Iterate through patients to find their last consult and count consults
        for (const patient of patients) {
            try {
                const patientConsults = await Consult.findAll({
                    where: {
                        _id_patient: patient._id_patient,
                    },
                });

                const consultCount = patientConsults.length; // Count consults

                const patientConsultsOrdered = await Consult.findAll({
                    where: {
                        _id_patient: patient._id_patient,
                    },
                    order: [["date", "DESC"]],
                    limit: 1, // Limit to one result (the most recent consult)
                });

                const lastConsult = patientConsultsOrdered[0]; // Get the last consult
                if (lastConsult) {
                    const motivo =
                        lastConsult.consult_json?.INF?.Motivo || null;
                    patient.dataValues.last_consult = motivo; // Assign last_consult to dataValues
                } else {
                    patient.dataValues.last_consult = null; // Set to null if no consults found
                }

                // Add consultCount to patient object
                patient.dataValues.consultCount = consultCount;
            } catch (error) {
                console.error(
                    `Error fetching consults for patient ${patient._id_patient}:`,
                    error
                );
                patient.last_consult = null; // Set to null in case of error
            }
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

export const getPatientBackgrounds = async (req, res) => {
    const { _id_patient } = req.query;

    try {
        // Check if _id_patient is provided
        if (!_id_patient) {
            return res.status(400).json({
                success: false,
                message: "_id_patient is required",
            });
        }

        const patientConsults = await Consult.findAll({
            where: {
                _id_patient,
            },
        });

        // Check if there are no consults for the given _id_patient
        if (!patientConsults || patientConsults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No consults found for the provided _id_patient",
            });
        }

        let backgrounds = {
            AHF: [],
            APP: [],
            APNP: [],
        };

        // Iterate through patientConsults
        patientConsults.forEach((consult) => {
            // Iterate through consult_json.AHF, consult_json.APP, and consult_json.APNP
            ["AHF", "APP", "APNP"].forEach((category) => {
                if (consult.consult_json && consult.consult_json[category]) {
                    // Filter out empty values and store all values in an array
                    Object.entries(consult.consult_json[category]).forEach(
                        ([key, value]) => {
                            if (value) {
                                backgrounds[category].push({
                                    title: key,
                                    content: value,
                                });
                            }
                        }
                    );
                }
            });
        });

        return res.json({
            success: true,
            patientBackgrounds: backgrounds,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred",
            error: error.message,
        });
    }
};

export const getPatientINF = async (req, res) => {
    const { _id_patient } = req.query;

    try {
        // Check if _id_patient is provided
        if (!_id_patient) {
            return res.status(400).json({
                success: false,
                message: "_id_patient is required",
            });
        }

        const patientConsults = await Consult.findAll({
            where: {
                _id_patient,
            },
        });

        // Check if there are no consults for the given _id_patient
        if (!patientConsults || patientConsults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No consults found for the provided _id_patient",
            });
        }

        let patientInfo = {
            INF: [],
        };

        // Iterate through patientConsults
        patientConsults.forEach((consult) => {
            // Iterate through consult_json.AHF, consult_json.APP, and consult_json.APNP
            ["INF"].forEach((category) => {
                if (consult.consult_json && consult.consult_json[category]) {
                    // Filter out empty values and store all values in an array
                    Object.entries(consult.consult_json[category]).forEach(
                        ([key, value]) => {
                            if (value && key !== "Motivo") {
                                // Check for similarity with existing titles
                                const similarTitle = patientInfo[category].find(
                                    (item) =>
                                        similarityScore(item.title, key) > 0.9
                                );

                                if (similarTitle) {
                                    // If similar title is found, update the content
                                    similarTitle.content = value;
                                } else {
                                    patientInfo[category].push({
                                        title: key,
                                        content: value,
                                    });
                                }
                            }
                        }
                    );
                }
            });
        });

        console.log("\n-- INF: ", patientInfo);
        return res.json({
            success: true,
            patient_info: patientInfo,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred",
            error: error.message,
        });
    }
};

export const uploadPatientFile = async (req, res) => {
    try {
        const { _id_patient } = req.query;

        const file = await MediaFile.create({
            _id_patient,
            type: "image",
            url: "",
        });

        const fileUrl = await uploadFile(
            req,
            res,
            file._id_media_file,
            `patients/${_id_patient}`
        );

        if (fileUrl) {
            await file.update({
                url: fileUrl,
            });
            return res
                .status(200)
                .send({ message: "File Uploaded Successfully", url: fileUrl });
        } else {
            return res.status(400).send({
                message: "Unable to upload file",
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: error.message });
    }
};
