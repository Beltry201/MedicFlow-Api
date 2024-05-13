import Joi from "joi";
import dotenv from "dotenv";
import { Consult } from "../../models/consults/consults.js";

dotenv.config();

export class ConsultService {
    async createConsult(userData) {
        try {
            const {
                audio_transcript,
                consult_json,
                template,
                _id_doctor,
                _id_patient,
                _id_consult,
            } = userData;

            // Validations
            const schema = Joi.object({
                audio_transcript: Joi.string().required(),
                consult_json: Joi.object(),
                template: Joi.object().required(),
                _id_doctor: Joi.string().uuid().required(),
                _id_patient: Joi.string().uuid().required(),
                _id_consult: Joi.string().uuid().allow("", null),
            });

            const { error } = schema.validate(userData);

            if (error) {
                throw new Error(error.details[0].message);
            }

            const corrected_json =
                await this.compareAndCorrectConsultWithTemplate(
                    template.template_json,
                    consult_json
                );

            console.log("WHAT ----", corrected_json);
            // Create or update the consult
            let consult;
            if (_id_consult && _id_consult !== "") {
                // Update existing consult
                consult = await Consult.findByPk(_id_consult);
                if (!consult) {
                    throw new Error("Consult not found");
                }
                if (consult_json) {
                    consult.consult_json = corrected_json;
                }
                consult.is_valid = true;
                await consult.save();
            } else {
                // Create new consult
                consult = await Consult.create({
                    audio_transcript,
                    consult_json: corrected_json,
                    _id_doctor,
                    _id_patient,
                    _id_template: template._id_template,
                    is_valid: false,
                });
            }
            console.log(consult);
            return consult;
        } catch (error) {
            console.error(error);
            throw new Error("Failed to create or update consult");
        }
    }

    async compareAndCorrectConsultWithTemplate(templateJson, clientJson) {
        try {
            // Deep clone the client JSON to avoid modifying the original object
            const correctedJson = JSON.parse(JSON.stringify(clientJson));

            // Compare and correct each key-value pair
            const traverse = (templateObj, clientObj) => {
                for (const key in templateObj) {
                    if (clientObj.hasOwnProperty(key)) {
                        // Check if the value is an object (recursively traverse)
                        if (typeof templateObj[key] === "object") {
                            if (Array.isArray(templateObj[key])) {
                                // Check if the value should be an array
                                if (!Array.isArray(clientObj[key])) {
                                    console.log(
                                        `Correcting '${key}' to an empty array.`
                                    );
                                    correctedJson[key] = []; // Correct to an empty array
                                } else {
                                    console.log(`Traversing array '${key}'.`);
                                    // Recursively traverse each object in the array
                                    for (
                                        let i = 0;
                                        i < clientObj[key].length;
                                        i++
                                    ) {
                                        traverse(
                                            templateObj[key][0],
                                            clientObj[key][i]
                                        );
                                    }
                                }
                            } else {
                                console.log(`Traversing object '${key}'.`);
                                traverse(templateObj[key], clientObj[key]);
                            }
                        }
                    } else {
                        // Add missing key-value pair from the template
                        console.log(
                            `Adding missing key '${key}' from the template.`
                        );
                        clientObj[key] = templateObj[key];
                    }
                }

                // Remove extra keys from the client JSON
                for (const key in clientObj) {
                    if (!templateObj.hasOwnProperty(key)) {
                        console.log(
                            `Removing extra key '${key}' from the client JSON.`
                        );
                        delete clientObj[key];
                    }
                }
            };

            // Start traversal from the root
            console.log("Starting comparison and correction process...");
            traverse(templateJson, correctedJson);

            console.log("Comparison and correction process completed.");
            return correctedJson;
        } catch (error) {
            console.error(error);
            throw new Error(
                "Failed to compare and correct consult with template"
            );
        }
    }
}
