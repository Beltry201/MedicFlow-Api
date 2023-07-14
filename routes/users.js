import { Router } from "express";
import {
    getUser,
    createUser,
    loginUser,
    resetPassword,
} from "../controllers/users.js";

const router = Router();

// Routes
router.get("/:id", getUser);
router.post("/login", loginUser);
router.post("/", createUser);
router.put("/resetPass", resetPassword);
// router.put("/:id", updateUser);
// router.delete("/:id", deleteUser);

export default router;
