import { TreatmentCatalog } from "../models/treatments_catalogs.js";

export const createTreatmentCatalog = async (req, res) => {
    try {
        const { name, price, duration_weeks, description, _id_doctor } =
            req.body;

        // Create a new treatment catalog into catalog in the database
        const newTreatmentCatalog = await TreatmentCatalog.create({
            name,
            price,
            duration_weeks,
            description,
            _id_doctor,
        });

        res.status(201).json({
            success: true,
            treatment_catalog: newTreatmentCatalog,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create treatment in catalog",
            error: error.message,
        });
    }
};

export const deleteTreatmentCatalog = async (req, res) => {
    try {
        const treatmentId = req.query._id_treatment_catalog;

        // Find the treatment_catalog by ID
        const treatment_catalog = await TreatmentCatalog.findByPk(treatmentId);

        if (!treatmentreatment_catalogt) {
            return res.status(404).json({
                success: false,
                message: "Treatment catalog not found",
            });
        }

        // Delete the treatment_catalog from the database
        await treatment_catalog.destroy();

        res.status(200).json({
            success: true,
            message: "Treatment catalog deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete treatment catalog",
            error: error.message,
        });
    }
};

export const updateTreatmentCatalog = async (req, res) => {
    try {
        const treatmentId = req.query._id_treatment_catalog;
        const { name, price, duration_weeks, description, _id_doctor } =
            req.body;

        // Find the treatment_catalog by ID
        const treatment_catalog = await TreatmentCatalog.findByPk(treatmentId);

        if (!treatment_catalog) {
            return res.status(404).json({
                success: false,
                message: "Treatment catalog not found",
            });
        }

        // Update the tretreatment_catalogatment in the database
        await treatment_catalog.update({
            name,
            price,
            duration_weeks,
            description,
            _id_doctor,
        });

        res.status(200).json({
            success: true,
            message: "Treatment catalog updated successfully",
            treatment_catalog,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update treatment catalog ",
            error: error.message,
        });
    }
};

export const getTreatmentCatalogDetails = async (req, res) => {
    try {
        const treatmentId = req.query._id_treatment_catalog;

        // Find the treatment_catalog by ID
        const treatment_catalog = await TreatmentCatalog.findByPk(treatmentId);

        if (!treatment_catalog) {
            return res.status(404).json({
                success: false,
                message: "Treatment catalog not found",
            });
        }

        res.status(200).json({ success: true, treatment_catalog });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to get treatment catalog details",
            error: error.message,
        });
    }
};

export const listTreatmentCatalogs = async (req, res) => {
    try {
        // Retrieve all treatments from the database
        const treatments_catalog = await TreatmentCatalog.findAll();

        res.status(200).json({ success: true, treatments_catalog });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve treatments catalog",
            error: error.message,
        });
    }
};

export const getDoctorTreatmentCatalogs = async (req, res) => {
    try {
        const doctorId = req.query._id_doctor;

        // Find all treatments_catalog for the given doctor ID
        const treatments_catalog = await TreatmentCatalog.findAll({
            where: {
                _id_doctor: doctorId,
            },
        });

        if (treatments_catalog.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No treatments catalog found for this doctor",
            });
        }

        res.status(200).json({ success: true, treatments_catalog });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to get doctor treatments catalog",
            error: error.message,
        });
    }
};
