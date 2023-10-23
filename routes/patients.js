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
    uploadPatientFile,
} from "../controllers/patients.js";
import {
    createNote,
    getNotesForPatient,
    updateNote,
    deleteNote,
} from "../controllers/notes.js";
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
router.post("/media", validateToken, uploadPatientFile);

router.get("/note", validateToken, getNotesForPatient);
router.post("/note", validateToken, createNote);
router.put("/note", validateToken, updateNote);
router.delete("/note", validateToken, deleteNote);

export default router;
