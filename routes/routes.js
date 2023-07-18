import { Router } from "express";
import userRoutes from './users.js';
import patientRoutes from './patients.js';

const router = Router();

// Main Routes
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);

export default router;