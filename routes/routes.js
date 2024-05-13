import { Router } from "express";
import userRoutes from "./users.js";
import adminRoutes from "./admin.js";
import consultRoutes from "./consults.js";
import patientRoutes from "./patients.js";
import templateRoutes from "./templates.js";
import clinicRoutes from "./clinics.js";
import consultRatingRoutes from "./consult_rating.js";
import calendarEventRoutes from "./calendar_event.js";

const router = Router();

// Main Routes
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/clinics", clinicRoutes);
router.use("/patients", patientRoutes);
router.use("/consults", consultRoutes);
router.use("/templates", templateRoutes);
router.use("/ratings", consultRatingRoutes);
router.use("/calendar_events", calendarEventRoutes);

export default router;
