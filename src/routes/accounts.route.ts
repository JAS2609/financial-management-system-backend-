import { Router } from "express";
import {
  createAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
} from "../controllers/accounts.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Protected routes
router.use(verifyJWT);

router.post("/", createAccount);
router.get("/", getAccounts);
router.patch("/:id", updateAccount);
router.delete("/:id", deleteAccount);

export default router;