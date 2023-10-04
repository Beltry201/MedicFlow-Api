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
            model: "gpt-4",
            temperature: 0.81,
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
    HISTORIA CLÍNICA ELECTRÓNICA

    Instrucciones:

    - A continuación, se le pedirá que ingrese detalles específicos sobre la interacción médico-paciente basándose en la conversación proporcionada.
    - Complete las secciones únicamente con la información proporcionada en el diálogo. NO añada información adicional o suposiciones.
    - Si no hay informacion deja los campos como string vacio.
    - Proporcione la información de manera estructurada y clara en el formato JSON compatible con RFC8259.
    - Una vez que haya completado el formato JSON, revíselo para asegurarse de que sea 100% preciso y que haya incluido toda la información relevante del diálogo.
    - Evite repetir información, ser redundante o incluir detalles no mencionados en el diálogo.
    - El motivo de consulta debe estar presente siempre y debe ser un formato corto (10 palabras aprox).
    - NO OMITA NINGÚN DATO, incluso si parece redundante o poco relevante.

    INF:
    Motivo de consulta: Razón principal por la que el paciente busca atención médica (obligatorio)
    Estado Civil.
    Ocupación.
    Escolaridad.
    Religión.
    Lugar de Origen.

    Diálogo Médico-Paciente:
    ["${transcript}"]
    
    Por favor, cree una historia clínica estructurada con los siguientes apartados, usando el formato JSON proporcionado a continuación:

    Datos del paciente
    Antecedentes Familiares (AHF): Mencione enfermedades o condiciones relevantes de familiares directos, como padre, madre, hermanos o abuelos.
    Antecedentes Patológicos Personales (APP): Incluye patologías, alergias, cirugías y hospitalizaciones e inmunizaciones.
    Antecedentes Personales No Patológicos (APNP): En caso de estar presente, incluir hábitos, medicación actual y otras características relevantes mencionadas.
    S.O.A.P (Subjetivo, Objetivo, Análisis, Plan)

    Formato JSON:
     `;

    const jsonStructure = {
        INF: {
            "Estado Civil": "",
            Ocupación: "",
            Escolaridad: "",
            Religión: "",
            "Lugar de Origen": "",
        },
        AHF: {},
        APP: {},
        APNP: {},
        SOAP: {
            Subjetivo: "",
            Objetivo: "",
            Analisis: "",
            Plan: "",
        },
    };

    const prompt = instruction + requestJson(jsonStructure);

    console.log(prompt);
    return prompt;
}
