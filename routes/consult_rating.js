import { Router } from "express";
import { createConsultRating } from "../controllers/consult/consult_rating.js";
import { validateToken } from "../helpers/jwt.js";

const router = Router();

// Routes
router.post("/", validateToken, createConsultRating);

export default router;
