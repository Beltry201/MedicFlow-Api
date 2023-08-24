import { Router } from 'express';
import { validateToken } from '../helpers/jwt.js';
import {
  createPatient,
  listPatients,
  getPatientDetails,
  updatePatient,
  deletePatient,
  getDoctorPatients, // Import the new controller function
} from '../controllers/patients.js';

const router = Router();

// Routes
router.post('/', validateToken, createPatient);
router.get('/', validateToken, listPatients);
router.get('/doctor/:doctorId', validateToken, getDoctorPatients); // New route for getting doctor patients
router.get('/:id', validateToken, getPatientDetails);
router.put('/:id', validateToken, updatePatient);
router.delete('/:id', validateToken, deletePatient);

export default router;