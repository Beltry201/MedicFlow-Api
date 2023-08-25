import { Router } from 'express';
import { validateToken } from '../helpers/jwt.js';
import {
  createParameterType,
  getAllParameterTypesForDoctor,
  updateParameterType,
  deleteParameterType,
} from '../controllers/parameter_types.js'; // Make sure to import the correct controller functions

const router = Router();

// Routes
router.post('/', validateToken, createParameterType);
router.get('/:_id_doctor', validateToken, getAllParameterTypesForDoctor);
router.put('/:id', validateToken, updateParameterType);
router.delete('/:id', validateToken, deleteParameterType);

export default router;
