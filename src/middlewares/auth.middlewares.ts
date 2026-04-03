import jwt from "jsonwebtoken";
import type { Request, NextFunction, Response } from "express";
import prisma from "../utils/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

interface DecodedToken {
  id: string;
  [key: string]: unknown;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    displayName: string;
    status: string;
    roleId: string;
    role: {
      name: string;
      canCreateRecords: boolean;
      canReadRecords: boolean;
      canUpdateRecords: boolean;
      canDeleteRecords: boolean;
      canAccessDashboard: boolean;
      canManageUsers: boolean;
    };
  };
}

export const verifyJWT = asyncHandler(async (req: AuthenticatedRequest, _: Response, next: NextFunction): Promise<void> => {
  const authHeader: string | undefined = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }

  const token: string = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as DecodedToken;

    const user = await prisma.user.findUnique({
  where: { id: decoded.id },
  select: {
    id: true,
    email: true,
    displayName: true,
    status: true,
    roleId: true,
    createdAt: true,
    updatedAt: true,
    role: true
  }
});

    if (!user) {
      throw new ApiError(401, "Invalid token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
});