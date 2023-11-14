import { Router } from "express";
import { validateToken } from "../helpers/jwt.js";
import {
    createTreatmentCatalog,
    deleteTreatmentCatalog,
    updateTreatmentCatalog,
    getTreatmentCatalogDetails,
    getDoctorTreatmentCatalogs,
} from "../controllers/user/treatments_catalogs.js";

const router = Router();

// Routes
router.post("/", validateToken, createTreatmentCatalog);
router.put("/", validateToken, updateTreatmentCatalog);
router.get("/details", validateToken, getTreatmentCatalogDetails);
router.delete("/", validateToken, deleteTreatmentCatalog);
router.get("/list", validateToken, getDoctorTreatmentCatalogs);

export default router;
