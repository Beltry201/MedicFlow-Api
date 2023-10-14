import { Router } from "express";
import { validateToken } from "../helpers/jwt.js";
import {
    createParameterType,
    getAllParameterTypesForDoctor,
    updateParameterType,
    deleteParameterType,
} from "../controllers/parameter_types.js"; // Make sure to import the correct controller functions

const router = Router();

// Routes
router.post("/", validateToken, createParameterType);
router.get("/", validateToken, getAllParameterTypesForDoctor);
router.put("/", validateToken, updateParameterType);
router.delete("/", validateToken, deleteParameterType);

export default router;
