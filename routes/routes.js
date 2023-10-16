import { Router } from "express";
import userRoutes from "./users.js";
import patientRoutes from "./patients.js";
import treatmentRoutes from "./treatments_catalogs.js";
import consultRoutes from "./consults.js";
import parameterTypesRoutes from "./parameter_types.js";
import consultRatingRoutes from "./consult_rating.js";

const router = Router();

// Main Routes
router.use("/users", userRoutes);
router.use("/patients", patientRoutes);
router.use("/treatments_catalog", treatmentRoutes);
router.use("/consults", consultRoutes);
router.use("/parameters", parameterTypesRoutes);
router.use("/ratings", consultRatingRoutes);

export default router;
