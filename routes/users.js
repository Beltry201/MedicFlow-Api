import { Router } from "express";
import { validateToken } from "../helpers/jwt.js"; // Import the validateToken middleware
import {
    getUser,
    createUser,
    loginUser,
    resetPassword,
    deactivateUser,
    verifyToken,
    updateUser,
} from "../controllers/user/users.js";

const router = Router();

// Routes
router.get("/token", validateToken, verifyToken);
router.get("/", validateToken, getUser);

router.post("/login", loginUser);
router.post("/", createUser);

router.put("/reset_password", validateToken, resetPassword);
router.put("/:id", validateToken, updateUser);
router.put("/", validateToken, updateUser);

router.delete("/deactivate", validateToken, deactivateUser);

export default router;
