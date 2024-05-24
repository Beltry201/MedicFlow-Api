import { Router } from "express";
import {
    createTemplate,
    getTemplatesForDoctor,
} from "../controllers/consult/templates.js";
import { validateToken } from "../helpers/jwt.js";

const router = Router();

// Routes
router.post("/", validateToken, createTemplate);
router.get("/", validateToken, getTemplatesForDoctor);

export default router;
