import { Router } from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser,
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/update", verifyJWT, updateUser);
export default router;