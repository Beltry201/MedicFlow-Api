import { Clinic } from "../../models/clinic/clinics.js";

export const createClinic = async (req, res) => {
    try {
        const { name, address, logo_url } = req.body;

        // Create a new clinic record in the database
        const clinic = await Clinic.create({
            name,
            address,
            logo_url,
        });

        // Return a success response with the created clinic
        return res.status(201).json({
            message: "Clinic created successfully",
            clinic,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};
