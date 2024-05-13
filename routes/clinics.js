import { Router } from "express";
import { createClinic } from "../controllers/user/clinic.js";

const router = Router();

// Routes
router.post("/", createClinic);

export default router;
