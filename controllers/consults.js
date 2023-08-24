import { Consult } from "../models/consults.js";
import { Background } from "../models/backgrounds.js";
import { Treatment } from "../models/treatments.js";
import { generateText } from "../helpers/openai_generate.js";
import { ParameterType } from "../models/parameter_types.js";

export const createConsult = async (req, res) => {
    try {
        const {
            audio_transcript,
            date,
            _id_doctor,
            _id_patient,
            _id_treatment_catalog,
        } = req.body;

        // Create a new consult in the database
        const newConsult = await Consult.create({
            audio_transcript,
            date,
            is_valid: true,
            _id_doctor,
            _id_patient,
            _id_treatment_catalog,
        });

        console.log("\n-- NEW CONSULT: ", newConsult);

        // Fetch treatment parameters for the doctor
        const treatmentParameters = await ParameterType.findAll({
            where: {
                _id_doctor,
                parameter_belongs_to: "treatment",
            },
            attributes: ["parameter_type_name", "category"], // Include category in the result
        });

        // Create a dictionary for treatment parameters
        const treatmentParameterDictionary = {};
        treatmentParameters.forEach((parameter) => {
            const categoryName = parameter.category;
            if (!treatmentParameterDictionary[categoryName]) {
                treatmentParameterDictionary[categoryName] = {};
            }
            treatmentParameterDictionary[categoryName][
                parameter.parameter_type_name
            ] = `[${parameter.parameter_type_name} del paciente]`;
        });

        // Fetch background parameters for the doctor
        const backgroundParameters = await ParameterType.findAll({
            where: {
                _id_doctor,
                parameter_belongs_to: "background",
            },
            attributes: ["parameter_type_name", "category"], // Include category in the result
        });

        // Create a dictionary for background parameters
        const backgroundParameterDictionary = {};
        backgroundParameters.forEach((parameter) => {
            const categoryName = parameter.category;
            if (!backgroundParameterDictionary[categoryName]) {
                backgroundParameterDictionary[categoryName] = {};
            }
            backgroundParameterDictionary[categoryName][
                parameter.parameter_type_name
            ] = `[${parameter.parameter_type_name} del paciente]`;
        });

        // Generate text using audio_transcript and the dictionaries
        const generatedText = await generateText(
            audio_transcript,
            backgroundParameterDictionary,
            treatmentParameterDictionary
        );

        console.log("\n-- GENERATED RESPONSE: ", generatedText);

        if (generatedText) {
            // Loop through the generated JSON and insert data into the Background table
            const categories = {
              "INF": undefined,  // No corresponding category
              "AHF": "AHF",
              "APNP": "APNP",
              "APP": "APP",
              "AGO": "AGO",
              "DGN": "DGN",
              "EN": "EN",
          };

            for (const sectionName in generatedText) {
                if (sectionName !== "INF") {
                    const categoryName = categories[sectionName];
                    const parameterName = Object.keys(
                        generatedText[sectionName]
                    )[0];
                    const content = generatedText[sectionName][parameterName];

                    console.log("\n-- SECTION NAME:", sectionName);
                    console.log("-- CATEGORY NAME:", categoryName);
                    console.log("-- PARAMETER NAME:", parameterName);
                    console.log("-- CONTENT:", content);

                    // Find the corresponding parameter in the ParameterType table
                    const parameter = await ParameterType.findOne({
                        where: {
                            _id_doctor: _id_doctor,
                            parameter_belongs_to: "background",
                            category: categoryName,
                            parameter_type_name: parameterName,
                        },
                    });

                    if (parameter) {
                        console.log("-- FOUND PARAMETER:", parameter);
                        // Insert data into the Background table
                        await Background.create({
                            _id_consult: newConsult._id_consult,
                            _id_parameter: parameter._id_parameter_type,
                            title: parameterName,
                            content,
                        });
                        // Insert data into the Treatment table
                        if (categoryName === "DGN" || categoryName === "EN") {
                            const treatmentType =
                                categoryName === "DGN"
                                    ? "DGN"
                                    : "EV";
                            await Treatment.create({
                                _id_consult: newConsult._id_consult,
                                _id_parameter: parameter._id_parameter_type,
                                treatment_type: treatmentType,
                                content,
                            });
                        }
                    } else {
                        console.log("-- PARAMETER NOT FOUND");
                    }
                } else {
                    console.log("-- SKIPPING SECTION:", sectionName);
                }
            }
        }

        res.status(201).json({
            success: true,
            consult: newConsult,
            treatment_parameters: treatmentParameterDictionary,
            background_parameters: backgroundParameterDictionary,
            consult_json: generatedText, // Use the parsed JSON
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create consult",
            error: error.message,
        });
    }
};
