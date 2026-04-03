import { Router } from "express";
import {
  getSummary,
  getCategoryBreakdown,
  getRecentActivity,
  getMonthlyTrends,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {requirePermission} from "../middlewares/rbac.middleware.js";
const router = Router();

router.use(verifyJWT);

router.get("/summary", requirePermission("canAccessDashboard"), getSummary);
router.get("/categories", requirePermission("canAccessDashboard"), getCategoryBreakdown);
router.get("/recent",requirePermission("canAccessDashboard"),getRecentActivity);
router.get("/trends",requirePermission("canAccessDashboard"), getMonthlyTrends);

export default router;