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
} from "../controllers/user/users.js";
import {
    getUserSubscription,
    createSubscription,
    updateSubscription,
} from "../controllers/subscription/subscriptions.js";
import {
    createPaymentMethod,
    getPaymentMethods,
    updatePaymentMethod,
    deletePaymentMethod,
} from "../controllers/subscription/payment_methods.js";
import { createPaymentRecord } from "../controllers/subscription/payment_records.js";
const router = Router();

// Routes
router.get("/payment_method", validateToken, getPaymentMethods);
router.get("/subscription", validateToken, getUserSubscription);
router.get("/token", validateToken, verifyToken);
router.get("/", validateToken, getUser);
router.get("/access_code", access_code);

router.post("/payment_method", validateToken, createPaymentMethod);
router.post("/subscription", validateToken, createSubscription);
router.post("/purchase", validateToken, createPaymentRecord);
router.post("/login", loginUser);
router.post("/", createUser);

router.put("/payment_method", validateToken, updatePaymentMethod);
router.put("/subscription", validateToken, updateSubscription);
router.put("/reset_password", validateToken, resetPassword);
router.put("/:id", validateToken, updateUser);
router.put("/", validateToken, updateUser);

router.delete("/payment_method", validateToken, deletePaymentMethod);
router.delete("/deactivate", validateToken, deactivateUser);

export default router;
