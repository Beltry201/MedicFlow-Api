import { Router } from "express";
import { validateToken } from "../helpers/jwt.js";
import {
    createPatient,
    getAllPatients,
    searchPatients,
    getPatientDetails,
    updatePatient,
    deletePatient,
    getDoctorPatients,
    getPatientBackgrounds,
    getPatientINF,
    uploadPatientFile,
} from "../controllers/patient/patients.js";
import {
    createNote,
    getNotesForPatient,
    updateNote,
    deleteNote,
} from "../controllers/patient/notes.js";
import { getPatientFiles } from "../controllers/bucket.js";
const router = Router();

// Routes
router.get("/", validateToken, getAllPatients);
router.get("/search", validateToken, searchPatients);
router.get("/details", validateToken, getPatientDetails);
router.get("/doctor", validateToken, getDoctorPatients);
router.get("/backgrounds_list", validateToken, getPatientBackgrounds);
router.get("/inf", validateToken, getPatientINF);
router.get("/note", validateToken, getNotesForPatient);
router.get("/media/list", validateToken, getPatientFiles);

router.post("/media", validateToken, uploadPatientFile);
router.post("/note", validateToken, createNote);
router.post("/", validateToken, createPatient);
router.put("/", validateToken, updatePatient);
router.put("/note", validateToken, updateNote);

router.delete("/", validateToken, deletePatient);
router.delete("/note", validateToken, deleteNote);
// DEPRECATED
// router.post("/media/base", validateToken, uploadBase64File);

export default router;
