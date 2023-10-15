import { Router } from "express";
import { validateToken } from "../helpers/jwt.js";
import {
    createPatient,
    listPatients,
    getPatientDetails,
    updatePatient,
    deletePatient,
    getDoctorPatients,
} from "../controllers/patients.js";

const router = Router();

// Routes
router.post("/", validateToken, createPatient);
router.get("/list", validateToken, listPatients);
router.get("/doctor", validateToken, getDoctorPatients);
router.get("/", validateToken, getPatientDetails);
router.put("/", validateToken, updatePatient);
router.delete("/", validateToken, deletePatient);

export default router;
