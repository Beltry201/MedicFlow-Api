import { Router } from "express";
import { validateToken } from "../helpers/jwt.js"; // Import the validateToken middleware
import {
    getUser,
    createUser,
    loginUser,
    resetPassword,
    deactivateUser,
} from "../controllers/users.js";

const router = Router();

// Routes
router.get("/:id", validateToken, getUser); // Protect the route with validateToken middleware
router.post("/login", loginUser);
router.post("/", createUser);
router.put("/resetPass", validateToken, resetPassword); // Protect the route with validateToken middleware
// router.put("/:id", validateToken, updateUser); // Example for protecting another route
router.delete("/deactivate/:id", validateToken, deactivateUser);

export default router;
