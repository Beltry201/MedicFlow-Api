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
router.get("/details", validateToken, getTreatmentCatalogDetails);
router.delete("/", validateToken, deleteTreatmentCatalog);
router.get("/list", getDoctorTreatmentCatalogs);

// router.get("/", validateToken, listTreatmentCatalogs);
export default router;
