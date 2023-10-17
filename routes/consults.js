import { Router } from "express";
import {
    generateJsonResponse,
    storeJsonData,
    getConsultDetails,
    getUserConsults,
    getPatientConsults,
} from "../controllers/consults.js";
import { validateToken } from "../helpers/jwt.js";

const router = Router();

// Routes
router.post("/", validateToken, storeJsonData);
router.get("/", validateToken, generateJsonResponse);
router.get("/consult_details", validateToken, getConsultDetails);
router.get("/consults_list", validateToken, getUserConsults);
router.get("/consults_list/patient", validateToken, getPatientConsults);

export default router;
