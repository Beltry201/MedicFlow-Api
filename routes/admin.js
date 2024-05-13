import { Router } from "express";
import { isAdmin } from "../helpers/admin_access.js";
import { validateToken } from "../helpers/jwt.js";

const adminRoutes = Router();

// Apply the 'validateToken' middleware to all routes in this router
adminRoutes.use(validateToken);

// Apply the 'isAdmin' middleware to all routes in this router
adminRoutes.use(isAdmin);

// Membership Plan routes

export default adminRoutes;
