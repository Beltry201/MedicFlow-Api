import { Router } from "express";
import { validateToken } from "../helpers/jwt.js";
import {
    createCalendarEvent,
    getCalendarEvents,
    updateCalendarEvent,
    deleteCalendarEvent,
    getClosestEventByDate,
} from "../controllers/user/calendar_events.js";

const router = Router();

// Routes
router.post("/", validateToken, createCalendarEvent);
router.get("/list", validateToken, getCalendarEvents);
router.put("/", validateToken, updateCalendarEvent);
router.delete("/", validateToken, deleteCalendarEvent);
router.get("/next", validateToken, getClosestEventByDate);

export default router;
