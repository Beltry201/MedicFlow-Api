import { ParameterType } from "../models/parameter_types.js";

export const createDefaultParameters = async function createDefaultParameters(user) {

    const defaultSoapCategories = {
        SOAP: ["Subjetivo", "Análisis", "Observaciones Extra", "Plan", "Objetivo"],
    };

    const soapPromises = [];

    // Create default parameters for SOAP category
    const soapParameterNames = defaultSoapCategories["SOAP"];
    soapParameterNames.forEach(async (parameterName) => {
        soapPromises.push(
            ParameterType.create({
                parameter_type_name: parameterName,
                parameter_belongs_to: "soap",
                category: "SOAP",
                _id_doctor: user._id_user,
            })
        );
    });

    // Wait for all promises to complete
    await Promise.all([...soapPromises]);
}