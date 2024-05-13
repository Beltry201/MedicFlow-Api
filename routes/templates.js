import { Router } from "express";
import { createTemplate } from "../controllers/consult/templates.js";

const router = Router();

// Routes
router.post("/", createTemplate);

export default router;
