import { Note } from "../models/patients/notes.js";

export const createNote = async (req, res) => {
    try {
        const { title, content, _id_consult, _id_media, _id_parameter } =
            req.body;

        const newNote = await Note.create({
            title,
            content,
            _id_consult,
            _id_media,
            _id_parameter,
        });

        res.status(201).json({
            success: true,
            note: newNote,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create note",
            error: error.message,
        });
    }
};

export const getNote = async (req, res) => {
    try {
        const note = await Note.findByPk(req.params.id, {
            include: [
                { model: ParameterType, attributes: ["parameter_type_name"] },
            ],
        });

        if (!note) {
            return res
                .status(404)
                .json({ success: false, message: "Note not found" });
        }

        res.status(200).json({ success: true, note });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve note",
            error: error.message,
        });
    }
};

export const listNotesForPatient = async (req, res) => {
    try {
        const _id_patient = req.query._id_patient;

        const notes = await Note.findAll({
            where: {
                _id_patient: _id_patient,
            },
            include: [
                { model: ParameterType, attributes: ["parameter_type_name"] },
            ],
        });

        res.status(200).json({
            success: true,
            notes,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve notes",
            error: error.message,
        });
    }
};

export const updateNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const note = await Note.findByPk(noteId);

        if (!note) {
            return res
                .status(404)
                .json({ success: false, message: "Note not found" });
        }

        const { title, content, _id_consult, _id_media, _id_parameter } =
            req.body;

        await note.update({
            title,
            content,
            _id_consult,
            _id_media,
            _id_parameter,
        });

        res.status(200).json({ success: true, note });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update note",
            error: error.message,
        });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const note = await Note.findByPk(noteId);

        if (!note) {
            return res
                .status(404)
                .json({ success: false, message: "Note not found" });
        }

        // Instead of physically deleting, we're marking as invalid
        await note.update({
            is_valid: false,
        });

        res.status(200).json({
            success: true,
            message: "Note marked as invalid",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete note",
            error: error.message,
        });
    }
};
