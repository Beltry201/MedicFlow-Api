import { Consult } from "../models/consults/consults.js";
import { Background } from "../models/consults/backgrounds.js";
import { Note } from "../models/users/notes.js";
import { generateText } from "../helpers/openai_generate.js";
import { ParameterType } from "../models/consults/parameter_types.js";
import { Patient } from "../models/users/patients.js";
import { Buffer } from "buffer";
import { User } from "../models/users/users.js";
import { ConsultRating } from "../models/consults/consult_rating.js";

import GoogleSheetsManager from "../helpers/sheets.js";

export const generateJsonResponse = async (req, res) => {
    const { audio_transcript, _id_doctor } = req.query;

    try {
        const backgroundParameterDictionary = {};
        const treatmentParameterDictionary = {};

        // Fetch treatment parameters for the doctor
        const treatmentParameters = await ParameterType.findAll({
            where: {
                _id_doctor,
                parameter_belongs_to: "soap",
            },
            attributes: ["parameter_type_name", "category"], // Include category in the result
        });

        const backgroundParameters = await ParameterType.findAll({
            where: {
                parameter_belongs_to: "background",
            },
            attributes: ["parameter_type_name", "category"],
        });

        // Create dictionaries for treatment and background parameters
        backgroundParameters.forEach((parameter) => {
            const categoryName = parameter.category;
            if (!backgroundParameterDictionary[categoryName]) {
                backgroundParameterDictionary[categoryName] = {};
            }
            backgroundParameterDictionary[categoryName][
                parameter.parameter_type_name
            ] = `[${parameter.parameter_type_name} del paciente]`;
        });

        treatmentParameters.forEach((parameter) => {
            const categoryName = parameter.category;
            if (!treatmentParameterDictionary[categoryName]) {
                treatmentParameterDictionary[categoryName] = {};
            }
            treatmentParameterDictionary[categoryName][
                parameter.parameter_type_name
            ] = `[${parameter.parameter_type_name} del paciente]`;
        });

        // Generate text using audio_transcript and the dictionaries
        const generatedText = await generateText(
            audio_transcript,
            backgroundParameterDictionary,
            treatmentParameterDictionary
        );

        res.status(200).json({
            success: true,
            consult_json: generatedText,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to generate JSON response",
            error: error.message,
        });
    }
};

export const storeJsonData = async (req, res) => {
    const manager = new GoogleSheetsManager();
    await manager.authorize();
    try {
        const {
            audio_transcript,
            _id_doctor,
            _id_patient,
            rating,
            attributes,
            consult_json,
            _id_treatment_catalog,
        } = req.body;

        const decodedAudioTranscript = Buffer.from(
            audio_transcript,
            "base64"
        ).toString("utf-8");

        let date = new Date();

        const treatmentCatalogId = _id_treatment_catalog || null;

        const consult = await Consult.create({
            audio_transcript: decodedAudioTranscript,
            consult_json: consult_json,
            date,
            is_valid: true,
            _id_doctor,
            _id_patient,
            _id_treatment_catalog: treatmentCatalogId,
        });

        // USER
        const consultDoctor = await User.findOne({
            where: { _id_user: consult._id_doctor },
        });
        const folderId = consultDoctor._id_folder;
        const email = consultDoctor.email;

        // PATIENT
        const consultPatient = await Patient.findOne({
            where: { _id_patient: consult._id_patient },
        });
        const consultFileName = consultPatient.name + "_" + date;
        const patient = {
            name: consultPatient.name,
            birth_date: consultPatient.birth_date,
            sex: consultPatient.gender,
            civil_state: consult_json.INF.civil_state,
            occupation: consult_json.INF.Ocupación,
            scholarship: consult_json.INF.Escolaridad,
            religion: consult_json.INF.Religión,
            origin: consult_json.INF["Lugar de Origen"],
        };

        const { AHF, APNP, APP } = consult_json;
        const backgrounds_list = { AHF, APNP, APP };

        for (const categoryName in consult_json) {
            const categoryData = consult_json[categoryName];

            const titles = Object.keys(categoryData);
            for (let i = 0; i < titles.length; i++) {
                const title = titles[i];
                let content = categoryData[title];
                // Replace null or undefined with "Na"
                if (content === null || content === undefined) {
                    content = "Na";
                }
                if (content !== "") {
                    let parameter;

                    if (
                        categoryName === "AHF" ||
                        categoryName === "APNP" ||
                        categoryName === "APP"
                    ) {
                        parameter = await ParameterType.findOne({
                            where: {
                                _id_doctor: _id_doctor,
                                parameter_belongs_to: "background",
                                category: categoryName,
                                parameter_type_name: title,
                            },
                        });

                        if (!parameter) {
                            // Si el parámetro no existe, créalo
                            parameter = await ParameterType.create({
                                _id_doctor: _id_doctor,
                                parameter_belongs_to: "background",
                                category: categoryName,
                                parameter_type_name: title,
                            });
                        }

                        await Background.create({
                            _id_consult: consult._id_consult,
                            _id_parameter: parameter._id_parameter_type,
                            title,
                            content,
                        });
                    } else if (categoryName === "SOAP") {
                        parameter = await ParameterType.findOne({
                            where: {
                                _id_doctor: _id_doctor,
                                parameter_belongs_to: "soap",
                                category: categoryName,
                                parameter_type_name: title,
                            },
                        });

                        if (!parameter) {
                            parameter = await ParameterType.create({
                                _id_doctor: _id_doctor,
                                parameter_belongs_to: "soap",
                                category: categoryName,
                                parameter_type_name: title,
                            });
                        }

                        if (content.trim() !== "") {
                            await Note.create({
                                _id_consult: consult._id_consult,
                                _id_parameter: parameter._id_parameter_type,
                                title,
                                content,
                            });
                        }
                    }
                }
            }
        }

        // SPREADSHEET
        // const spreadsheet = await manager.createSpreadsheet(
        //     consultFileName,
        //     folderId,
        //     email
        // );

        // await manager.create_inf_sheet(spreadsheet, patient);

        // await manager.create_category_sheets(spreadsheet, backgrounds_list);

        // await manager.create_soap_sheet(spreadsheet, consult_json.SOAP);

        // await manager.create_complete_consult_sheet(spreadsheet, consult_json);

        // const newConsult = await Consult.findOne({
        //     where: { _id_consult: consult._id_consult },
        //     include: [
        //         { model: Patient },
        //         { model: Background },
        //         { model: Note },
        //     ],
        // });

        // RATING
        if (rating !== undefined && attributes !== undefined) {
            await ConsultRating.create({
                rating,
                attributes,
                _id_doctor,
                _id_consult: newConsult._id_consult,
            });
        } else {
            console.log(
                "Rating or attributes missing. Skipping consult rating creation."
            );
        }

        const formattedConsult = {
            id_consult: newConsult._id_consult,
            date: newConsult.date,
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
                {
                    model: Background,
                    include: [
                        {
                            model: ParameterType,
                        },
                    ],
                },
                {
                    model: Note,
                    include: [
                        {
                            model: ParameterType,
                        },
                    ],
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
        const _id_doctor = req.query._id_doctor;

        // Retrieve all consults for the given doctor
        const consults = await Consult.findAll({
            where: {
                _id_doctor: _id_doctor,
            },
            include: [
                {
                    model: Note,
                    as: "Notes",
                    attributes: ["title", "content"],
                },
                {
                    model: Patient,
                    as: "Patient",
                    attributes: ["name", "birth_date", "gender"],
                },
                {
                    model: TreatmentCatalog, // Add this include for TreatmentCatalog
                    attributes: ["name"], // Include only the 'name' attribute from TreatmentCatalog
                    as: "TreatmentCatalog", // Set an alias for the included TreatmentCatalog
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
                    treatment: consult.TreatmentCatalog.name, // Access the name from the included TreatmentCatalog
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
