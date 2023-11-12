import OpenAIApi from "openai";
import dotenv from "dotenv";
import { execSync } from "child_process";
dotenv.config();

const openai = new OpenAIApi({
    apiKey: execSync("source ~/.zshrc && echo $OPENAI_API_KEY", {
        encoding: "utf-8",
    }).trim(),
});

const jsonStructure = {
    INF: {
        Motivo: "",
        "Estado Civil": "",
        Ocupación: "",
        Escolaridad: "",
        Religión: "",
        "Lugar de Origen": "",
        "CIE-10": "",
    },
    AHF: {},
    APP: {},
    APNP: {},
    EF: {},
    SOAP: {
        Subjetivo: "",
        Objetivo: "",
        Analisis: "",
        Plan: "",
    },
};

// Function to generate the JSON response structure
const requestJson = (jsonStructure) =>
    `${JSON.stringify(jsonStructure, null, 2)}`;

export async function generateText(transcript) {
    console.log("\n-- SENDIND PROMPT");
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        "Eres un asistente médico virtual responsable de generar objetos JSON que contienen historias clínicas detalladas de las consultas médicas realizadas por el doctor.",
                },
                {
                    role: "user",
                    content:
                        "Necesito que crees un JSON sobre mis consultas medicas siguiendo las siguientes isntrucciones: ",
                },
                {
                    role: "user",
                    content:
                        "1. Ingrese detalles específicos sobre la interacción médico-paciente basándose en la conversación proporcionada.",
                },
                {
                    role: "user",
                    content:
                        "2. Si no hay información sobre algún valor no regreses la llave.",
                },
                {
                    role: "user",
                    content:
                        "3. Complete las secciones únicamente con la información proporcionada en el diálogo. NO añada información adicional o suposiciones.",
                },
                {
                    role: "user",
                    content:
                        "4. Una vez que haya completado el formato JSON, revíselo para asegurarse de que sea 100% preciso y que haya incluido toda la información relevante del diálogo.",
                },
                {
                    role: "user",
                    content:
                        "5. Evite repetir información, ser redundante o incluir detalles no mencionados en el diálogo.",
                },
                {
                    role: "user",
                    content:
                        "6. El motivo de la consulta debe estar presente siempre y debe ser un formato corto (10 palabras aprox).",
                },
                {
                    role: "user",
                    content:
                        "7. Obligatoriamente identifica todos los diagnósticos del paciente y agrégalos en el formato CIE-10 con descripción dentro de Exploracion Fisica",
                },
                {
                    role: "user",
                    content:
                        "cree una historia clínica estructurada con los apartados, usando el formato JSON proporcionado a continuación:",
                },
                {
                    role: "user",
                    content:
                        "- Datos del paciente (INF): Motivo: Razón principal por la que el paciente busca atención médica (obligatorio), Estado Civil, Ocupación, Escolaridad, Religión, Lugar de Origen y CIE-10 (incluye el nombre de la enfermedad).",
                },
                {
                    role: "user",
                    content:
                        "- Antecedentes Familiares (AHF): Mencione enfermedades o condiciones relevantes de familiares directos, como padre, madre, hermanos o abuelos.",
                },
                {
                    role: "user",
                    content:
                        "Antecedentes Patológicos Personales (APP): Incluye patologías, alergias, cirugías y hospitalizaciones e inmunizaciones.",
                },
                {
                    role: "user",
                    content:
                        "Antecedentes Personales No Patológicos (APNP): En caso de estar presente, incluir hábitos, medicación actual y otras características relevantes mencionadas.",
                },
                {
                    role: "user",
                    content:
                        "Exploración Física (EF): Solo los datos de exploración física.",
                },
                {
                    role: "user",
                    content: "S.O.A.P (Subjetivo, Objetivo, Análisis, Plan)",
                },
                {
                    role: "user",
                    content: requestJson(jsonStructure),
                },
                {
                    role: "user",
                    content: `Ahora ve la conversación:  ${transcript}`,
                },
            ],
            response_format: { type: "json_object" },
            model: "gpt-3.5-turbo-1106",
            temperature: 0.81,
        });
        console.log("\n-- COMPLETION: ", completion);
        return completion;
    } catch (error) {
        console.error("Error generating text:", error);
        return completion;
    }
}
