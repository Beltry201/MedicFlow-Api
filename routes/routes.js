import { Router } from "express";
import userRoutes from './users.js';
import patientRoutes from './patients.js';
import treatmentRoutes from './treatments.js'
import consultRoutes from './consults.js'
import parameterTypesRoutes from './parameter_types.js'

const router = Router();

// Main Routes
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/treatments', treatmentRoutes);
router.use('/consults', consultRoutes);
router.use('/parameters', parameterTypesRoutes)

export default router;