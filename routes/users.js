import { Router } from "express";
import { validateToken } from "../helpers/jwt.js";
import {
    getUser,
    createUser,
    loginUser,
    resetPassword,
    deactivateUser,
    verifyToken,
    updateUser,
    startNewSubscription,
} from "../controllers/user/users.js";

const router = Router();

// Routes
router.get("/token", verifyToken);
router.get("/", validateToken, getUser);

router.post("/login", loginUser);
router.post("/", createUser);
router.post("/subscription", validateToken, startNewSubscription);

router.put("/reset_password", validateToken, resetPassword);
router.put("/:id", validateToken, updateUser);
router.put("/", validateToken, updateUser);

router.delete("/deactivate", validateToken, deactivateUser);

export default router;
