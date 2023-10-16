import { CalendarEvent } from "../models/users/calendar_events.js";
import { Op } from "sequelize";

export const createCalendarEvent = async (req, res) => {
    try {
        // Validate request body
        const {
            title,
            start_date,
            end_date,
            description,
            _id_doctor,
            _id_patient,
        } = req.body;

        if (!title || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "Title, start date, and end date are required",
            });
        }

        // Perform additional validations if needed (e.g., date format, ID existence)

        const calendarEvent = await CalendarEvent.create({
            title,
            start_date,
            end_date,
            description,
            _id_doctor,
            _id_patient,
        });

        return res.status(201).json({
            success: true,
            message: "Calendar event created successfully",
            calendarEvent,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create calendar event",
            error: error.message,
        });
    }
};

export const getCalendarEvents = async (req, res) => {
    try {
        const { doctorId, patientId } = req.query;

        // Get the current date to determine the start and end of the month
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
        );

        // Define filters based on query parameters
        const filters = {
            start_date: {
                [Op.gte]: startOfMonth,
                [Op.lte]: endOfMonth,
            },
        };

        if (doctorId) {
            filters._id_doctor = doctorId;
        }

        if (patientId) {
            filters._id_patient = patientId;
        }

        const calendarEvents = await CalendarEvent.findAll({ where: filters });

        return res.status(200).json({ success: true, calendarEvents });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve calendar events",
            error: error.message,
        });
    }
};
