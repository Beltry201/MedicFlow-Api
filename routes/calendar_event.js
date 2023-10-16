import { Router } from "express";
import {
    createCalendarEvent,
    getCalendarEvents,
    updateCalendarEvent,
    deleteCalendarEvent,
} from "../controllers/calendar_events.js";

const router = Router();

// Routes
router.post("/", createCalendarEvent);
router.get("/", getCalendarEvents);
router.put("/:id", updateCalendarEvent);
router.delete("/:id", deleteCalendarEvent);

export default router;
