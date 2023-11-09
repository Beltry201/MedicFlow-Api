import { ConsultRating } from "../../models/consults/consult_rating.js";

export const createConsultRating = async (req, res) => {
    try {
        const { rating, attributes, _id_doctor, _id_consult } = req.body;

        // Crear la calificación de consulta en la base de datos
        const newConsultRating = await ConsultRating.create({
            rating, // Cambio de magnitud a rating
            attributes,
            _id_doctor,
            _id_consult,
        });

        res.status(201).json({
            success: true,
            feedback: "Calificación de consulta creada exitosamente",
            consultRating: newConsultRating,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al crear la calificación de consulta",
            error: error.message,
        });
    }
};
