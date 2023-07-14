import { Router } from "express";
import userRoutes from './users.js'

const router = Router();

// Main Routes
router.use('/users', userRoutes);

export default router;