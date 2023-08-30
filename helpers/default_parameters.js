import { ParameterType } from "../models/parameter_types.js";

export const createDefaultParameters = async function createDefaultParameters(user) {
    const defaultBackgroundCategories = {
        AHF: ["Diabéticos"],
        APNP: ["Alcoholismo", "Tabaquismo", "Inmunizaciones"],
        APP: ["Alérgicos", "Diabetes Mellitus", "Otras Observaciones", "Envejecimiento Facial Prematuro"],
    };

    const defaultSoapCategories = {
        SOAP: ["Subjetivo", "Análisis", "Observaciones Extra", "Plan", "Objetivo"],
    };

    const backgroundPromises = [];
    const soapPromises = [];

    // Create default parameters for background categories
    for (const category in defaultBackgroundCategories) {
        const parameterNames = defaultBackgroundCategories[category];
        parameterNames.forEach(async (parameterName) => {
            backgroundPromises.push(
                ParameterType.create({
                    parameter_type_name: parameterName,
                    parameter_belongs_to: "background",
                    category,
                    _id_doctor: user._id_user,
                })
            );
        });
    }

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
    await Promise.all([...backgroundPromises, ...soapPromises]);
}