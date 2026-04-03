import { Router } from "express";
import {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
} from "../controllers/records.controller.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {requirePermission} from "../middlewares/rbac.middleware.js";
const router = Router();

// All routes protected
router.use(verifyJWT);

router.post("/",requirePermission("canCreateRecords"), createRecord);
router.get("/",requirePermission("canReadRecords"), getRecords);
router.patch("/:id",requirePermission("canUpdateRecords"),updateRecord);
router.delete("/:id",requirePermission("canDeleteRecords"), deleteRecord);

export default router;