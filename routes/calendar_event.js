import { Router } from "express";
import { validateToken } from "../helpers/jwt.js";
import {
    createCalendarEvent,
    getCalendarEvents,
    updateCalendarEvent,
    deleteCalendarEvent,
} from "../controllers/calendar_events.js";

const router = Router();

// Routes
router.post("/", validateToken, createCalendarEvent);
router.get("/", validateToken, getCalendarEvents);
router.put("/:id", validateToken, updateCalendarEvent);
router.delete("/:id", validateToken, deleteCalendarEvent);

export default router;
