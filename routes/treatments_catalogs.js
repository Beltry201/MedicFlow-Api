import { Router } from "express";
import { validateToken } from "../helpers/jwt.js";
import {
    createTreatmentCatalog,
    deleteTreatmentCatalog,
    updateTreatmentCatalog,
    getTreatmentCatalogDetails,
    listTreatmentCatalogs,
    getDoctorTreatmentCatalogs,
} from "../controllers/treatments_catalogs.js";

const router = Router();

// Routes
router.post("/", validateToken, createTreatmentCatalog);
router.put("/", validateToken, updateTreatmentCatalog);
router.get("/", validateToken, getTreatmentCatalogDetails);
router.get("/", validateToken, listTreatmentCatalogs);
router.delete("/", validateToken, deleteTreatmentCatalog);
router.get("/", getDoctorTreatmentCatalogs);

export default router;
