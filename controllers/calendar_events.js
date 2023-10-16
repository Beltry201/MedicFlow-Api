import { CalendarEvent } from "../models/users/calendar_events.js";

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
        const { startDate, endDate, doctorId, patientId } = req.query;

        // Define filters based on query parameters
        const filters = {};

        if (startDate) {
            filters.start_date = { [Op.gte]: new Date(startDate) };
        }

        if (endDate) {
            filters.end_date = { [Op.lte]: new Date(endDate) };
        }

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

export const updateCalendarEvent = async (req, res) => {
    try {
        const { _id_calendar_event } = req.query;
        const {
            title,
            start_date,
            end_date,
            description,
            _id_doctor,
            _id_patient,
        } = req.body;

        // Validate request body
        if (!title || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "Title, start date, and end date are required",
            });
        }

        // Perform additional validations if needed

        const updatedCalendarEvent = await CalendarEvent.update(
            {
                title,
                start_date,
                end_date,
                description,
                _id_doctor,
                _id_patient,
            },
            { where: { _id_calendar_event } }
        );

        return res.status(200).json({
            success: true,
            message: "Calendar event updated successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update calendar event",
            error: error.message,
        });
    }
};

export const deleteCalendarEvent = async (req, res) => {
    try {
        const { _id_calendar_event } = req.query;

        const deletedCalendarEvent = await CalendarEvent.destroy({
            where: { _id_calendar_event },
        });

        if (!deletedCalendarEvent) {
            return res
                .status(404)
                .json({ success: false, message: "Calendar event not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Calendar event deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete calendar event",
            error: error.message,
        });
    }
};
