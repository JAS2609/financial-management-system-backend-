import type{ Request, Response } from "express";
import prisma  from "../utils/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Extend Request
interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// Create Account
export const createAccount = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, type } = req.body;

    if (!name || !type) {
      throw new ApiError(400, "Name and type are required");
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        userId: req.user!.id,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, account, "Account created"));
  }
);

//Get Accounts
export const getAccounts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const accounts = await prisma.account.findMany({
      where: {
        userId: req.user!.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, accounts, "Accounts fetched"));
  }
);

// Update Account
export const updateAccount = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, type } = req.body;

    const existing = await prisma.account.findUnique({
      where: { id:id as string },
    });

    if (!existing || existing.userId !== req.user!.id) {
      throw new ApiError(404, "Account not found");
    }

    const updated = await prisma.account.update({
      where: { id:id as string },
      data: {
        name,
        type,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Account updated"));
  }
);

//Delete Account
export const deleteAccount = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const existing = await prisma.account.findUnique({
      where: { id: id as string },
    });

    if (!existing || existing.userId !== req.user!.id) {
      throw new ApiError(404, "Account not found");
    }

    await prisma.account.delete({
      where: { id: id as string },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Account deleted"));
  }
);