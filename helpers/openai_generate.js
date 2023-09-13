import OpenAIApi from "openai";
import dotenv from "dotenv";
import { execSync } from "child_process";
dotenv.config();

const openai = new OpenAIApi({
    apiKey: execSync("source ~/.zshrc && echo $OPENAI_API_KEY", {
        encoding: "utf-8",
    }).trim(),
});
// Function to generate the JSON response structure
const requestJson = (jsonStructure) => `

${JSON.stringify(jsonStructure, null, 2)}`;

export async function generateText(transcript, background, treatment) {
    let prompt = generatePrompt(transcript, background, treatment);
    console.log("\n-- PROMPT: ", prompt);

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        "Eres un asistente médico encargado de redactar historias médicas para pacientes.",
                },
                { role: "user", content: prompt },
            ],
            model: "gpt-3.5-turbo",
            temperature: 0.1,
        });

        console.log(completion.choices);
        console.log("\n-- TOKENS: ", completion.usage);
        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error("Error generating text:", error);
        return "";
    }
}

function generatePrompt(transcript, background, treatment) {
    console.log(
        "\n-- TRANSCRIPT: ",
        transcript,
        "\n-- BACKGROUND: ",
        background,
        "\n-- TREATMENT: ",
        treatment
    );

    const instruction = `
    En base a los siguientes comentarios del médico: "${transcript}"
    Escribe la historia clinica con antecedentes (Agrega los parametros de antecedentes por tu cuenta) y soap.
    - Si no encutras datos sobre algún parametro deja el obejeto de JSON como null
    - No incluyas ninguna explicación, solo proporcione una respuesta JSON compatible con RFC8259 siguiendo este formato sin desviaciones: `;

    const jsonStructure = {
        INF: {
            "Estado Civil": "[Estado civil del paciente]",
            Ocupación: "[Ocupación del paciente]",
            Escolaridad: "[Nivel de escolaridad del paciente]",
            Religión: "[Religión del paciente]",
            "Lugar de Origen": "[Lugar de origen del paciente]",
        },
        AHF: {},
        APP: {},
        APNP: {},
    };

    // Add background parameters
    // for (const category in background) {
    //     jsonStructure[category] = {};
    //     for (const parameter in background[category]) {
    //         jsonStructure[category][parameter] = `[${parameter} del paciente]`;
    //     }
    // }

    // Add background parameters
    for (const category in treatment) {
        jsonStructure[category] = {};
        for (const parameter in treatment[category]) {
            jsonStructure[category][parameter] = `[${parameter} del paciente]`;
        }
    }

    const prompt = instruction + requestJson(jsonStructure);

    console.log(prompt);
    return prompt;
}
