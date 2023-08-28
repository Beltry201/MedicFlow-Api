import { Router } from "express";
import {
  generateJsonResponse,
  storeJsonData,
  getConsultById,
  getUserConsults
} from "../controllers/consults.js";
import { validateToken } from "../helpers/jwt.js";

const router = Router();

// Routes
// router.post("/", validateToken, createConsult);
router.post("/", validateToken, storeJsonData);
router.get("/", validateToken, generateJsonResponse);
router.get("/consult_details/", validateToken, getConsultById);
router.get("/consults_list/", validateToken, getUserConsults);

export default router;
