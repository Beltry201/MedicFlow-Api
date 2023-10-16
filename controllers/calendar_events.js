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
        const { patientId } = req.query;

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

export const getClosestEventByDate = async (req, res) => {
    try {
        const { _id_doctor } = req.query;

        // Validate if _id_doctor is provided
        if (!_id_doctor) {
            return res.status(400).json({
                success: false,
                message: "_id_doctor parameter is required",
            });
        }

        const closestEvent = await CalendarEvent.findOne({
            where: {
                _id_doctor,
                start_date: {
                    [Op.gte]: new Date(),
                },
            },
            order: [
                ["start_date", "ASC"], // Sort by start date in ascending order
            ],
        });

        if (!closestEvent) {
            return res.status(404).json({
                success: false,
                message: "No events found for the specified doctor",
            });
        }

        return res.status(200).json({ success: true, closestEvent });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to get closest event",
            error: error.message,
        });
    }
};
