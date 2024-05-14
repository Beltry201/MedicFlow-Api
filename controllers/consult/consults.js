import { ConsultRating } from "../../models/consults/consult_rating.js";
import { MediaFile } from "../../models/patients/media_files.js";
import { Consult } from "../../models/consults/consults.js";
import { Patient } from "../../models/patients/patients.js";
import { uploadFile } from "../bucket.js";
import { Buffer } from "buffer";
import { BedrockService } from "../../services/prompts/aws_claude3.js";
import { Template } from "../../models/clinic/templates.js";
import { ConsultService } from "../../services/consults/consults.js";

const consultService = new ConsultService();

export const generateConsultTemplate = async (req, res) => {
    const clientData = req.body;
    const user = req.user;
    try {
        const template = await Template.findByPk(clientData._id_template);

        const bedrockService = new BedrockService();
        const consult_json = await bedrockService.runPrompt(
            template.prompt,
            clientData.audio_transcript,
            template.template_json
        );
        const userData = {
            consult_json,
            audio_transcript: clientData.audio_transcript,
            template,
            _id_patient: clientData._id_patient,
            _id_doctor: user._id_doctor,
        };
        const newConsult = await consultService.createConsult(userData);
        console.log(newConsult);
        res.status(200).json({
            success: true,
            message: "Consult datasheet created successfully",
            consult: newConsult,
        });
    } catch (error) {
        console.error("Error in generateConsultTemplate:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate consult template",
            error: error.message,
        });
    }
};

export const saveConsult = async (req, res) => {
    try {
        const { _id_consult, consult_json } = req.body;

        // Check if _id_consult is provided
        if (!_id_consult) {
            return res.status(400).json({
                success: false,
                message: "_id_consult is required",
            });
        }

        const consult = await consultService.updateConsult(
            _id_consult,
            consult_json
        );

        res.status(200).json({
            success: true,
            message: "Consult updated successfully",
            consult,
        });
    } catch (error) {
        console.error("Error in saveConsult:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save consult",
            error: error.message,
        });
    }
};

export const createConsult = async (req, res) => {
    try {
        const {
            recording_duration_s,
            whisper_version,
            completion_tokens,
            prompt_tokens,
            treatment,
            rating,
            attributes,
            audio_transcript,
            consult_json,
            _id_patient,
            _id_treatment_catalog,
        } = req.body;

        console.log("\n-- TOKENS: ", completion_tokens, " ", prompt_tokens);
        const _id_doctor = req.user._id_user;

        let date = new Date();

        const decodedAudioTranscript = Buffer.from(
            audio_transcript,
            "base64"
        ).toString("utf-8");

        // Create Consult
        const consult = await Consult.create({
            audio_transcript: decodedAudioTranscript,
            consult_json: consult_json,
            date,
            treatment_name: treatment.name,
            treatment_price: treatment.price,
            recording_duration_s,
            whisper_version,
            completion_tokens,
            prompt_tokens,
            _id_treatment_catalog,
            _id_doctor,
            _id_patient,
        });

        // Create Rating
        if (rating !== undefined && attributes !== undefined) {
            await ConsultRating.create({
                rating,
                attributes,
                _id_doctor,
                _id_consult: consult._id_consult,
            });
        } else {
            console.log(
                "Rating or attributes missing. Skipping consult rating creation."
            );
        }
        const newConsult = await Consult.findOne({
            where: { _id_consult: consult._id_consult },
            include: [{ model: Patient }],
        });

        const formattedConsult = {
            id_consult: consult._id_consult,
            date: consult.date,
            treatment: {
                name: consult.treatment_name,
                price: consult.treatment_price,
            },
            patient: {
                _id_patient,
                name: newConsult.Patient.name,
                last_name: newConsult.Patient.last_name,
                birth_date: newConsult.Patient.birth_date,
                gender: newConsult.Patient.gender,
                phone_number: newConsult.Patient.phone_number,
            },
            consult_json,
        };

        res.status(201).json({
            success: true,
            message: "JSON data stored successfully",
            consult: formattedConsult,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to store JSON data",
            error: error.message,
        });
    }
};

export const getConsultDetails = async (req, res) => {
    try {
        const _id_consult = req.query._id_consult;

        // Find the consult by ID
        const consult = await Consult.findOne({
            where: { _id_consult: _id_consult },
            include: [
                {
                    model: Patient,
                },
            ],
        });

        if (!consult) {
            return res.status(404).json({
                success: false,
                message: "Consult not found",
            });
        }

        const formattedConsult = {
            id_consult: consult._id_consult,
            date: consult.date,
            treatment: {
                name: consult.treatment_name,
                price: consult.treatment_price,
            },
            patient: {
                _id_patient: consult.Patient._id_patient,
                name: consult.Patient.name,
                last_name: consult.Patient.last_name,
                birth_date: consult.Patient.birth_date,
                gender: consult.Patient.gender,
                phone_number: consult.Patient.phone_number,
            },
            consult_json: consult.consult_json,
        };

        res.status(200).json({
            success: true,
            message: "Consult retrieved successfully",
            consult: formattedConsult,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve consult",
            error: error.message,
        });
    }
};

export const getUserConsults = async (req, res) => {
    try {
        const _id_doctor = req.user._id_doctor;

        // Retrieve all consults for the given doctor
        const consults = await Consult.findAll({
            where: {
                _id_doctor: _id_doctor,
            },
            include: [
                {
                    model: Patient,
                    as: "Patient",
                    attributes: ["name", "last_name", "birth_date", "gender"],
                },
            ],
        });

        if (consults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No consults found for the given doctor",
            });
        }

        res.status(200).json({
            success: true,
            consults,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user consults",
            error: error.message,
        });
    }
};

export const getPatientConsults = async (req, res) => {
    try {
        const _id_patient = req.query._id_patient;

        // Retrieve all consults for the given patient
        const consults = await Consult.findAll({
            where: {
                _id_patient: _id_patient,
            },
            include: [
                {
                    model: Patient,
                    as: "Patient",
                    attributes: ["name", "last_name", "birth_date", "gender"],
                },
            ],
        });

        if (consults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No consults found for the given patient",
            });
        }

        res.status(200).json({
            success: true,
            consults: consults.map((consult) => {
                return {
                    _id_consult: consult._id_consult,
                    date: consult.date,
                    treatment: {
                        name: consult.treatment_name,
                        price: consult.treatment_price,
                    },
                    patient: {
                        name: consult.Patient.name,
                        last_name: consult.Patient.last_name,
                        birth_date: consult.Patient.birth_date,
                        gender: consult.Patient.gender,
                    },
                    consult_json: consult.consult_json,
                };
            }),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch patient consults",
            error: error.message,
        });
    }
};

export const uploadConsultFile = async (req, res) => {
    try {
        const { _id_patient, _id_consult } = req.query;

        const file = await MediaFile.create({
            _id_patient,
            _id_consult,
            type: "image",
            url: "",
        });

        const fileUrl = await uploadFile(
            req,
            res,
            file._id_media_file,
            `consults/${_id_patient}/${_id_consult}`
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

export const claudeprompt = async (req, res) => {
    try {
        const { prompt, model } = req.body;
        let bds = new BedrockService();
        const answer = await bds.runPrompt(prompt, model);
        console.log("Answer from Bedrock Sonnet model:", answer);

        if (answer) {
            return res
                .status(200)
                .send({ message: "Prompt Success", answer: answer });
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
