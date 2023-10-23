import { Router } from "express";
import { validateToken } from "../helpers/jwt.js"; // Import the validateToken middleware
import {
    getUser,
    createUser,
    loginUser,
    access_code,
    resetPassword,
    deactivateUser,
    verifyToken,
    updateUser,
    // gtokens,
} from "../controllers/users.js";

const router = Router();

// Routes
router.get("/", validateToken, getUser);
router.get("/access_code", access_code);
router.get("/token", validateToken, verifyToken);
router.post("/login", loginUser);
router.post("/", createUser);
router.put("/", validateToken, updateUser);
router.put("/reset_password", validateToken, resetPassword);
router.delete("/deactivate", validateToken, deactivateUser);

// router.put("/:id", validateToken, updateUser);
// router.get("/gtokens", gtokens);

export default router;
