import { Consult } from "../models/consults.js";
import { Background } from "../models/backgrounds.js";
import { Treatment } from "../models/treatments.js";
import { generateText } from "../helpers/openai_generate.js";
import { ParameterType } from "../models/parameter_types.js";
import { Patient } from "../models/patients.js";
import { Buffer } from 'buffer'; // Asegúrate de tener la librería buffer instalada

// export const createConsult = async (req, res) => {
//     try {
//         const {
//             audio_transcript,
//             date,
//             _id_doctor,
//             _id_patient,
//             _id_treatment_catalog,
//         } = req.body;

//         // Create a new consult in the database
//         const newConsult = await Consult.create({
//             audio_transcript,
//             date,
//             is_valid: true,
//             _id_doctor,
//             _id_patient,
//             _id_treatment_catalog,
//         });

//         console.log("\n-- NEW CONSULT: ", newConsult);

//         // Fetch treatment parameters for the doctor
//         const treatmentParameters = await ParameterType.findAll({
//             where: {
//                 _id_doctor,
//                 parameter_belongs_to: "treatment",
//             },
//             attributes: ["parameter_type_name", "category"], // Include category in the result
//         });

//         // Create a dictionary for treatment parameters
//         const treatmentParameterDictionary = {};
//         treatmentParameters.forEach((parameter) => {
//             const categoryName = parameter.category;
//             if (!treatmentParameterDictionary[categoryName]) {
//                 treatmentParameterDictionary[categoryName] = {};
//             }
//             treatmentParameterDictionary[categoryName][
//                 parameter.parameter_type_name
//             ] = `[${parameter.parameter_type_name} del paciente]`;
//         });

//         // Fetch background parameters for the doctor
//         const backgroundParameters = await ParameterType.findAll({
//             where: {
//                 _id_doctor,
//                 parameter_belongs_to: "background",
//             },
//             attributes: ["parameter_type_name", "category"], // Include category in the result
//         });

//         // Create a dictionary for background parameters
//         const backgroundParameterDictionary = {};
//         backgroundParameters.forEach((parameter) => {
//             const categoryName = parameter.category;
//             if (!backgroundParameterDictionary[categoryName]) {
//                 backgroundParameterDictionary[categoryName] = {};
//             }
//             backgroundParameterDictionary[categoryName][
//                 parameter.parameter_type_name
//             ] = `[${parameter.parameter_type_name} del paciente]`;
//         });

//         // Generate text using audio_transcript and the dictionaries
//         const generatedText = await generateText(
//             audio_transcript,
//             backgroundParameterDictionary,
//             treatmentParameterDictionary
//         );

//         console.log("\n-- GENERATED RESPONSE: ", generatedText);

//         if (generatedText) {
//             // Loop through the generated JSON and insert data into the Background table
//             const categories = {
//                 INF: undefined, // No corresponding category
//                 AHF: "AHF",
//                 APNP: "APNP",
//                 APP: "APP",
//                 AGO: "AGO",
//                 DGN: "DGN",
//                 EN: "EN",
//             };

//             for (const sectionName in generatedText) {
//                 if (sectionName !== "INF") {
//                     const categoryName = categories[sectionName];
//                     const parameterName = Object.keys(
//                         generatedText[sectionName]
//                     )[0];
//                     const content = generatedText[sectionName][parameterName];

//                     console.log("\n-- SECTION NAME:", sectionName);
//                     console.log("-- CATEGORY NAME:", categoryName);
//                     console.log("-- PARAMETER NAME:", parameterName);
//                     console.log("-- CONTENT:", content);

//                     // Find the corresponding parameter in the ParameterType table
//                     const parameter = await ParameterType.findOne({
//                         where: {
//                             _id_doctor: _id_doctor,
//                             parameter_belongs_to: "background",
//                             category: categoryName,
//                             parameter_type_name: parameterName,
//                         },
//                     });

//                     if (parameter) {
//                         console.log("-- FOUND PARAMETER:", parameter);
//                         // Insert data into the Background table
//                         await Background.create({
//                             _id_consult: newConsult._id_consult,
//                             _id_parameter: parameter._id_parameter_type,
//                             title: parameterName,
//                             content,
//                         });
//                         // Insert data into the Treatment table
//                         if (categoryName === "DGN" || categoryName === "EN") {
//                             const treatmentType =
//                                 categoryName === "DGN" ? "DGN" : "EV";
//                             await Treatment.create({
//                                 _id_consult: newConsult._id_consult,
//                                 _id_parameter: parameter._id_parameter_type,
//                                 treatment_type: treatmentType,
//                                 content,
//                             });
//                         }
//                     } else {
//                         console.log("-- PARAMETER NOT FOUND");
//                     }
//                 } else {
//                     console.log("-- SKIPPING SECTION:", sectionName);
//                 }
//             }
//         }

//         res.status(201).json({
//             success: true,
//             consult: newConsult,
//             treatment_parameters: treatmentParameterDictionary,
//             background_parameters: backgroundParameterDictionary,
//             consult_json: generatedText, // Use the parsed JSON
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to create consult",
//             error: error.message,
//         });
//     }
// };

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
    try {
        const {
            audio_transcript,
            _id_doctor,
            _id_patient,
            consult_json,
        } = req.body;

        const decodedAudioTranscript = Buffer.from(audio_transcript, 'base64').toString('utf-8');

        let date = new Date();
        const consult = await Consult.create({
            audio_transcript: decodedAudioTranscript,
            date,
            is_valid: true,
            _id_doctor,
            _id_patient,
            _id_treatment_catalog: "209ecf44-0b07-49e1-820c-107bcbdf76fb",
        });

        for (const categoryName in consult_json) {
            const categoryData = consult_json[categoryName];

            for (const title in categoryData) {
                const content = categoryData[title];

                if (content.trim() !== "") {
                    let parameter;

                    if (
                        categoryName === "AHF" ||
                        categoryName === "APNP" ||
                        categoryName === "APP" ||
                        categoryName === "AGO"
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
                            await Treatment.create({
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
                    model: Treatment,
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
            consult_json
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


export const getConsultById = async (req, res) => {
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
                    model: Treatment,
                    include: [
                        {
                            model: ParameterType,
                        },
                    ],
                },
            ],
        });
        

        if (!consult) {
            return res
                .status(404)
                .json({ success: false, message: "Consult not found" });
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

        // Group treatments by category
        consult.Treatments.forEach((treatment) => {
            const parameterType = treatment.ParameterType;
            if (!consult_json[parameterType.category]) {
                consult_json[parameterType.category] = {};
            }
            consult_json[parameterType.category][treatment.title] =
                treatment.content;
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
                    model: Treatment,
                    as: "Treatments", // Make sure this matches the name in the association
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
                    soap: consult.Treatments.map((treatment) => {
                        return {
                            title: treatment.title,
                            content: treatment.content,
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
