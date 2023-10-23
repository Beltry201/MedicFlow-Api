import { Note } from "../models/patients/notes.js";

export const createNote = async (req, res) => {
    try {
        const { content, _id_patient } = req.body;

        const newNote = await Note.create({
            content,
            _id_patient,
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

export const getNotesForPatient = async (req, res) => {
    try {
        const { _id_patient } = req.query;

        const notes = await Note.findAll({
            where: {
                _id_patient,
            },
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
        const { _id_note } = req.query;
        const { content } = req.body;

        const [updatedRows] = await Note.update(
            { content },
            {
                where: {
                    _id_note,
                },
            }
        );

        if (updatedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Note updated successfully",
        });
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
        const { _id_note } = req.query;

        const deletedRows = await Note.destroy({
            where: {
                _id_note,
            },
        });

        if (deletedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Note not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Note deleted successfully",
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
