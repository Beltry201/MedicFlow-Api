import { Router } from "express";
import { validateToken } from "../helpers/jwt.js";
import {
    createParameterType,
    getAllParameterTypesForDoctor,
    updateParameterType,
    deleteParameterType,
} from "../controllers/consult/parameter_types.js";

const router = Router();

// Routes
router.post("/", validateToken, createParameterType);
router.get("/", validateToken, getAllParameterTypesForDoctor);
router.put("/", validateToken, updateParameterType);
router.delete("/", validateToken, deleteParameterType);

export default router;
