import { Template } from "../../models/clinic/templates.js";

export const createTemplate = async (req, res) => {
    try {
        const { name, prompt, template_json, _id_clinic } = req.body;

        // Create a new template record in the database
        const template = await Template.create({
            name,
            prompt,
            template_json,
            _id_clinic,
        });

        // Return a success response with the created template
        return res.status(201).json({
            message: "Template created successfully",
            template,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
};
