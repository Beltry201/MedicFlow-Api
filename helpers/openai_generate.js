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

export async function generateText(transcript, background, note) {
    let prompt = generatePrompt(transcript, background, note);
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

function generatePrompt(transcript, background, note) {
    console.log(
        "\n-- TRANSCRIPT: ",
        transcript,
        "\n-- BACKGROUND: ",
        background,
        "\n-- TREATMENT: ",
        note
    );

    const instruction = `
    En base a los siguientes comentarios del médico: "${transcript}"

    Escribe la historia clinica con antecedentes (Agrega los parametros de antecedentes por tu cuenta) y soap.
    - Si no hay INF deja los campos como string vacio.
    - El SOAP siempre debe estar completo, menciona que no hay datos en cualquier caso que no se identifique un objeto de soap.
    - Las llaves de los antecedentes siempre serán el subjetivo (principal causa) de la consulta
    - No incluyas ninguna explicación, solo proporcione una respuesta JSON compatible con RFC8259 siguiendo este formato sin desviaciones: `;

    const jsonStructure = {
        INF: {
            "Estado Civil": "",
            "Ocupación": "",
            "Escolaridad": "",
            "Religión": "",
            "Lugar de Origen": "",
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

    // Add notes parameters
    for (const category in note) {
        jsonStructure[category] = {};
        for (const parameter in note[category]) {
            jsonStructure[category][parameter] = `[${parameter} del paciente]`;
        }
    }

    const prompt = instruction + requestJson(jsonStructure);

    console.log(prompt);
    return prompt;
}
