import { Router } from "express";
import {
    generateConsultTemplate,
    getConsultDetails,
    getUserConsults,
    getPatientConsults,
    uploadConsultFile,
    claudeprompt,
} from "../controllers/consult/consults.js";
import { validateToken } from "../helpers/jwt.js";

const router = Router();

// Routes
// router.post("/", validateToken, storeJsonData);
router.post("/", validateToken, generateConsultTemplate);
router.get("/consult_details", validateToken, getConsultDetails);
router.get("/", validateToken, getUserConsults);
router.get("/consults_list/patient", validateToken, getPatientConsults);
router.post("/media", validateToken, uploadConsultFile);
router.post("/claude", validateToken, claudeprompt);

export default router;
