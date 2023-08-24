import { Router } from 'express';
import { validateToken } from '../helpers/jwt.js';
import {
  createTreatment,
  deleteTreatment,
  updateTreatment,
  getTreatmentDetails,
  listTreatments,
  getDoctorTreatments
} from '../controllers/treatments.js';

const router = Router();

// Routes
router.post('/', validateToken, createTreatment);
router.put('/:id', validateToken, updateTreatment);
router.get('/:id', validateToken, getTreatmentDetails);
router.get('/', validateToken, listTreatments);
router.delete('/:id', validateToken, deleteTreatment);
router.get('/:_id_doctor', getDoctorTreatments)

export default router;