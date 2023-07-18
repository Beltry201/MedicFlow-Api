import { Router } from "express";
import { validateToken } from "../helpers/jwt.js"; // Import the validateToken middleware
import {
    // getPatient,
    createPatient,
    // deactivatePatient,
} from "../controllers/patients.js";
import { ValidationError } from "sequelize";

const router = Router();
// TODO:
// - Update
// - Deactivate / Delete
// - Get Patient Details
// - Get Patients List


// Routes
router.post("/", validateToken, createPatient);


export default router;
