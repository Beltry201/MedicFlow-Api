import { Router } from "express";
import {
  createConsult,
  // getConsultDetails,
  // getDoctorConsults,
  // updateConsult,
  // deactivateConsult,
} from "../controllers/consults.js";
import { validateToken } from "../helpers/jwt.js";

const router = Router();

// Routes
router.post("/", validateToken, createConsult);
// router.get("/:id", validateToken, getConsultDetails);
// router.get("/doctor/:doctorId", validateToken, getDoctorConsults);
// router.put("/:id", validateToken, updateConsult);
// router.put("/deactivate/:id", validateToken, deactivateConsult);

export default router;
