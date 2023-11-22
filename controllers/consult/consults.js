import { TreatmentCatalog } from "../../models/users/treatments_catalogs.js";
import { canGenerateMoreConsults } from "../subscription/subscriptions.js";
import { ConsultRating } from "../../models/consults/consult_rating.js";
import { MediaFile } from "../../models/patients/media_files.js";
import { generateText } from "../../helpers/openai_generate.js";
import { Consult } from "../../models/consults/consults.js";
import { Patient } from "../../models/patients/patients.js";
import { uploadFile } from "../bucket.js";
import { Buffer } from "buffer";

export const generateJsonResponse = async (req, res) => {
    const { audio_transcript } = req.query;
    const user = req.user;

    try {
        const eligibilityResult = await canGenerateMoreConsults(user._id_user);

        if (eligibilityResult.success) {
            let completion;

            try {
                completion = await generateText(audio_transcript);
            } catch (error) {
                if (
                    completion.choices &&
                    completion.choices[0].finish_reason === "length"
                ) {
                    console.error("Error generating text:", error);

                    return res.status(400).json({
                        success: false,
                        message: "Prompt is too long",
                    });
                } else {
                    console.error("Error generating text:", error);
                    throw error; // Rethrow the error for unexpected cases
                }
            }

            const responsePayload = {
                success: true,
                consult_json: JSON.parse(completion.choices[0].message.content),
                membership: {
                    plan: eligibilityResult.membership
                        ? eligibilityResult.membership.plan_name
                        : "Free Tier",
                    consult_limit: eligibilityResult.membership
                        ? eligibilityResult.membership.consults_limit
                        : null,
                    minutes_per_consult: eligibilityResult.membership
                        ? eligibilityResult.membership.min_per_consult
                        : null,
                },
                subscription: {
                    consult_count: eligibilityResult.consultCount || 0,
                    start_date: eligibilityResult.subscription
                        ? eligibilityResult.subscription.subscription_start_date
                        : null,
                    end_date: eligibilityResult.subscription
                        ? eligibilityResult.subscription.subscription_end_date
                        : null,
                    state: eligibilityResult.subscription
                        ? eligibilityResult.subscription.state
                        : null,
                },
                prompt_tokens: completion.usage.prompt_tokens,
                completion_tokens: completion.usage.completion_tokens,
            };

            res.status(200).json(responsePayload);
        } else {
            res.status(403).json({
                success: false,
                message: "Monthly consult limit reached",
                membership: {
                    plan: eligibilityResult.membership
                        ? eligibilityResult.membership.plan_name
                        : "Free Tier",
                    consult_limit: eligibilityResult.membership
                        ? eligibilityResult.membership.consults_limit
                        : null,
                    minutes_per_consult: eligibilityResult.membership
                        ? eligibilityResult.membership.min_per_consult
                        : null,
                },
                subscription: {
                    consult_count: eligibilityResult.consultCount,
                    start_date: eligibilityResult.subscription
                        ? eligibilityResult.subscription.subscription_start_date
                        : null,
                    end_date: eligibilityResult.subscription
                        ? eligibilityResult.subscription.subscription_end_date
                        : null,
                    state: eligibilityResult.subscription
                        ? eligibilityResult.subscription.state
                        : null,
                },
            });
        }
    } catch (error) {
        console.error("Error in generateJsonResponse:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate JSON response",
            error: error.message,
        });
    }
};

export const storeJsonData = async (req, res) => {
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
        const _id_doctor = req.user._id_user;

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
                {
                    model: TreatmentCatalog,
                    attributes: ["name"],
                    as: "TreatmentCatalog",
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
            consults: consults.map((consult) => {
                console.log(
                    "\n-- CONSULTA: ",
                    consult.consult_json.INF["Motivo"]
                );
                return {
                    _id_consult: consult._id_consult,
                    date: consult.date,
                    patient: {
                        name: consult.Patient.name,
                        last_name: consult.Patient.last_name,
                        birth_date: consult.Patient.birth_date,
                        gender: consult.Patient.gender,
                    },
                    motivo: consult.consult_json.INF["Motivo"],
                    treatment: consult.TreatmentCatalog
                        ? consult.TreatmentCatalog.name
                        : null,
                };
            }),
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
                {
                    model: TreatmentCatalog,
                    attributes: ["name"],
                    as: "TreatmentCatalog",
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
