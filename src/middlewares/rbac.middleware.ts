import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";


type Permission =[ | "canCreateRecords"| "canReadRecords"| "canUpdateRecords"| "canDeleteRecords"| "canAccessDashboard"| "canManageUsers" ];
 

export const requirePermission = (permission: keyof any) => {
  return (req: any, _: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !user.role) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!user.role[permission]) {
      throw new ApiError(403, "Forbidden: insufficient permissions");
    }

    next();
  };
};