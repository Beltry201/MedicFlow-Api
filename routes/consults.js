import { Router } from "express";
import {
    generateConsultTemplate,
    saveConsult,
    getConsultDetails,
    getUserConsults,
    getPatientConsults,
    uploadConsultFile,
    claudeprompt,
    transcribeAudio,
    createConsult,
} from "../controllers/consult/consults.js";
import { validateToken } from "../helpers/jwt.js";

const router = Router();

// Routes
router.post("/", validateToken, createConsult);
router.post("/generate", validateToken, generateConsultTemplate);
router.put("/", validateToken, saveConsult);
router.get("/consult_details", validateToken, getConsultDetails);
router.get("/", validateToken, getUserConsults);
router.get("/consults_list/patient", validateToken, getPatientConsults);
router.post("/media", validateToken, uploadConsultFile);
router.post("/claude", validateToken, claudeprompt);
router.post("/transcribe", validateToken, transcribeAudio);

export default router;
