import { Router } from "express";
import { isAdmin } from "../helpers/admin_access.js";
import { validateToken } from "../helpers/jwt.js";
import {
    createMembershipPlan,
    updateMembershipPlan,
    deleteMembershipPlan,
} from "../controllers/subscription/membership_plans.js";

const adminRoutes = Router();

// Apply the 'validateToken' middleware to all routes in this router
adminRoutes.use(validateToken);

// Apply the 'isAdmin' middleware to all routes in this router
adminRoutes.use(isAdmin);

// Membership Plan routes
adminRoutes.post("/membership-plans", createMembershipPlan);
adminRoutes.put("/membership-plans/:planId", updateMembershipPlan);
adminRoutes.delete("/membership-plans/:planId", deleteMembershipPlan);

export default adminRoutes;
