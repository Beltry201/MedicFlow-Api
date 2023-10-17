import { Router } from "express";
import { validateToken } from "../helpers/jwt.js";
import {
    createPatient,
    listPatients,
    getPatientDetails,
    updatePatient,
    deletePatient,
    getDoctorPatients,
    getPatientBackgrounds,
    getPatientINF,
} from "../controllers/patients.js";

const router = Router();

// Routes
router.post("/", validateToken, createPatient);
router.get("/list", validateToken, listPatients);
router.get("/doctor", validateToken, getDoctorPatients);
router.get("/", validateToken, getPatientDetails);
router.put("/", validateToken, updatePatient);
router.delete("/", validateToken, deletePatient);
router.get("/backgrounds_list", validateToken, getPatientBackgrounds);
router.get("/inf", validateToken, getPatientINF);
export default router;
