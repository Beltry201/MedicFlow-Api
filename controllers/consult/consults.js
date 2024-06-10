import { Consult } from "../../models/consults/consults.js";
import { Patient } from "../../models/patients/patients.js";
import { BedrockService } from "../../services/prompts/aws_claude3.js";
import { Template } from "../../models/clinic/templates.js";
import { ConsultService } from "../../services/consults/consults.js";
import { MediaService } from "../../services/medias/medias.js";
import { TranscriptionService } from "../../services/transcriptions/transcriptions.js";
import { generatePresignedUrl } from "../../helpers/s3.js";

const consultService = new ConsultService();
const mediaService = new MediaService();
const transcriptionService = new TranscriptionService();
const bedrockService = new BedrockService();

export const transcribeAudio = async (req, res) => {
    const audioUrl = req.body.audioUrl;
    try {
        const trnasecriptionResult =
            await transcriptionService.transcribeAudioFromUrl(audioUrl);
        res.status(200).json({
            success: true,
            message: "Audio transcribed successfully",
            data: trnasecriptionResult,
        });
    } catch (error) {
        console.error("Error in transcribeAudio:", error);
        res.status(500).json({
            success: false,
            message: "Failed to transcribe audio",
            error: error.message,
        });
    }
};

export const uploadAudio = async (req, res) => {
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

        if (!consult_json || typeof consult_json !== "object") {
            throw new Error("Invalid consult_json format");
        }

        const userData = {
            title: clientData.title,
            consult_json,
            audio_transcript: clientData.audio_transcript,
            template,
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

export const createConsult = async (req, res) => {
    const { patientName, _id_template } = req.query;
    const user = req.user;
    try {
        // Step 1: Create consult with initial state and data
        const consult = await Consult.create({
            title: patientName,
            _id_doctor: user._id_doctor,
            _id_template: _id_template,
        });

        const fileName = `${patientName.replace(/\s/g, "")}_${
            consult._id_consult
        }_${new Date().toISOString()}`;

        // Step 2: Upload the file to S3 and get the file URL and key
        const { fileUrl, key } = await mediaService.uploadAudioFile(
            req,
            res,
            user._id_doctor,
            fileName
        );

        console.info("\nFile uploaded succesfullt, URL:", fileUrl);

        // Step 3: Update the consult with the audio URL
        await consult.update({ audio_url: fileUrl });

        // Step 4: Generate a presigned URL using the key
        const presignedUrl = await generatePresignedUrl(key);

        console.info("\nPresigned URL generated successfully:", presignedUrl);

        // Step 5: Transcribe the audio using the presigned URL
        let audio_transcript =
            await transcriptionService.transcribeAudioFromUrl(presignedUrl);

        console.info(
            "\nAudio transcribed successfully:\n",
            audio_transcript.results.channels[0].alternatives[0].transcript
        );

        audio_transcript =
            audio_transcript.results.channels[0].alternatives[0].transcript;

        // Step 6: Update the consult with the audio transcript
        await consult.update({ audio_transcript });

        // Step 7: Generate the consult using the Claude prompt
        const template = await Template.findByPk(_id_template);
        const consult_json = await bedrockService.runPrompt(
            template.prompt,
            audio_transcript,
            template.template_json
        );

        if (!consult_json || typeof consult_json !== "object") {
            throw new Error("Invalid consult_json format");
        }

        // Step 8: Update the consult with the consult template
        await consult.update({ consult_json });

        res.status(200).json({
            success: true,
            message: "Consult created successfully",
            consult,
        });
    } catch (error) {
        console.error("Error in createConsult:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create consult",
            error: error.message,
        });
    }
};

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

        if (!consult_json || typeof consult_json !== "object") {
            throw new Error("Invalid consult_json format");
        }

        const userData = {
            title: clientData.title,
            consult_json,
            audio_transcript: clientData.audio_transcript,
            template,
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
            claude_response: error,
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
    const _id_doctor = req.user._id_doctor;
    try {
        const fileUrl = await mediaService.uploadAudioFile(
            req,
            res,
            _id_doctor
        );
        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            fileUrl,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
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
