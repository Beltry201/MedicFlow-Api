import { Consult } from "../models/consults.js";
import { Background } from "../models/backgrounds.js";
import { Note } from "../models/notes.js";
import { generateText } from "../helpers/openai_generate.js";
import { ParameterType } from "../models/parameter_types.js";
import { Patient } from "../models/patients.js";
import { Buffer } from "buffer";
import { User } from "../models/users.js";

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
        const { audio_transcript, _id_doctor, _id_patient, consult_json } =
            req.body;

        const decodedAudioTranscript = Buffer.from(
            audio_transcript,
            "base64"
        ).toString("utf-8");

        let date = new Date();
        const consult = await Consult.create({
            audio_transcript: decodedAudioTranscript,
            date,
            is_valid: true,
            _id_doctor,
            _id_patient,
            _id_treatment_catalog: "209ecf44-0b07-49e1-820c-107bcbdf76fb",
        });

        // USER
        const consultDoctor = await User.findOne({
            where: { _id_user: consult._id_doctor },
        });
        const folderId = consultDoctor._id_folder;
        const email = consultDoctor.email

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

        // SPREADSHEET
        const { AHF, APNP, APP } = consult_json;
        const backgrounds_list = { AHF, APNP, APP };

        for (const categoryName in consult_json) {
            const categoryData = consult_json[categoryName];

            const titles = Object.keys(categoryData);
            for (let i = 0; i < titles.length; i++) {
                const title = titles[i];
                console.log("TITLE: ", title);
                let content = categoryData[title];
                console.log("CONTENT: ", content);
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

        const spreadsheet = await manager.createSpreadsheet(
            consultFileName,
            folderId,
            email
        );
        console.log("\n-- SPREADSHEET ID: ", spreadsheet);

        const inf = await manager.create_inf_sheet(spreadsheet, patient);
        console.log("\n-- INF: ", inf);

        const backgrounds_sheet = await manager.create_category_sheets(
            spreadsheet,
            backgrounds_list
        );
        console.log("\n-- BACKGROUND SHEET: ", backgrounds_sheet);

        const soap_sheet = await manager.create_soap_sheet(
            spreadsheet,
            consult_json.SOAP
        );
        console.log("\n-- SOAP SHEET: ", soap_sheet);

        const complete_sheet = await manager.create_complete_consult_sheet(
            spreadsheet,
            consult_json
        );

        console.log("\n-- COMPLETE SHEET: ", complete_sheet);

        // TODO: unecessary use the created object instead of calling new one
        const newConsult = await Consult.findOne({
            where: { _id_consult: consult._id_consult },
            include: [
                {
                    model: Patient,
                },
                {
                    model: Background,
                },
                {
                    model: Note,
                },
            ],
        });

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
        const { _id_consult } = req.query;

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

        const consult_json = {};

        // Group backgrounds by category
        consult.Backgrounds.forEach((background) => {
            const parameterType = background.ParameterType;
            if (!consult_json[parameterType.category]) {
                consult_json[parameterType.category] = {};
            }
            consult_json[parameterType.category][background.title] =
                background.content;
        });

        // Group notes by category
        consult.Treatments.forEach((note) => {
            const parameterType = note.ParameterType;
            if (!consult_json[parameterType.category]) {
                consult_json[parameterType.category] = {};
            }
            consult_json[parameterType.category][note.title] = note.content;
        });

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
            consult_json: consult_json,
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
        const { _id_doctor } = req.query;

        // Retrieve all consults for the given doctor
        const consults = await Consult.findAll({
            where: {
                _id_doctor: _id_doctor,
            },
            include: [
                {
                    model: Note,
                    as: "Notes", // Make sure this matches the name in the association
                    attributes: ["title", "content"],
                },
                {
                    model: Patient, // Assuming you have a Patient model
                    as: "Patient", // Make sure this matches the name in the association
                    attributes: ["name", "birth_date", "gender"],
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
                return {
                    _id_consult: consult._id_consult,
                    date: consult.date,
                    patient: {
                        name: consult.Patient.name,
                        birth_date: consult.Patient.birth_date,
                        gender: consult.Patient.gender,
                    },
                    soap: consult.Notes.map((note) => {
                        return {
                            title: note.title,
                            content: note.content,
                        };
                    }),
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
