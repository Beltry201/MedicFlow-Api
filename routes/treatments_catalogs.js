import { Router } from 'express';
import { validateToken } from '../helpers/jwt.js';
import {
  createTreatmentCatalog,
  deleteTreatmentCatalog,
  updateTreatmentCatalog,
  getTreatmentCatalogDetails,
  listTreatmentCatalogs,
  getDoctorTreatmentCatalogs
} from '../controllers/treatments_catalogs.js';

const router = Router();

// Routes
router.post('/', validateToken, createTreatmentCatalog);
router.put('/:id', validateToken, updateTreatmentCatalog);
router.get('/:id', validateToken, getTreatmentCatalogDetails);
router.get('/', validateToken, listTreatmentCatalogs);
router.delete('/:id', validateToken, deleteTreatmentCatalog);
router.get('/:_id_doctor', getDoctorTreatmentCatalogs)

export default router;