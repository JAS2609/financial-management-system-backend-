import type{ Request, Response } from "express";
import  prisma  from "../utils/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: {
      name: string;
    };
  };
}

//  Create Record
export const createRecord = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      amount,
      type,
      category,
      date,
      notes,
      accountId,
      fromAccountId,
      toAccountId,
    } = req.body;

if (!amount || !type) {
  throw new ApiError(400, "Required fields missing");
}

if (type === "TRANSFER") {
    const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account || account.userId !== req.user!.id) {
    throw new ApiError(403, "Invalid account");
  }

  if (!fromAccountId || !toAccountId) {
    throw new ApiError(400, "Transfer requires both accounts");
  }
  if (fromAccountId === toAccountId) {
  throw new ApiError(400, "Cannot transfer to the same account");
}
  const from = await prisma.account.findUnique({
  where: { id: fromAccountId },
});

const to = await prisma.account.findUnique({
  where: { id: toAccountId },
});

if (!from || !to) {
  throw new ApiError(400, "Invalid accounts");
}

if (from.userId !== req.user!.id || to.userId !== req.user!.id) {
  throw new ApiError(403, "Transfers allowed only between your own accounts");
}
} else {
  if (!accountId) {
    throw new ApiError(400, "accountId required");
  }
}

    const record = await prisma.financialRecord.create({
      data: {
        amount,
        type,
        category,
        date: date ? new Date(date) : new Date(),
        notes,
        userId: req.user!.id,
        accountId,
        fromAccountId,
        toAccountId,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, record, "Record created"));
  }
);

// Get Records
export const getRecords = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { type, category, startDate, endDate } = req.query;

    const filters: any = {
      userId: req.user!.id,
      deletedAt: null,
    };

    if (type) filters.type = type;
    if (category) filters.category = category;

    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.gte = new Date(startDate as string);
      if (endDate) filters.date.lte = new Date(endDate as string);
    }

    const records = await prisma.financialRecord.findMany({
      where: filters,
      orderBy: { date: "desc" },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, records, "Records fetched"));
  }
);

// Update Record
export const updateRecord = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const existing = await prisma.financialRecord.findUnique({
      where: { id:id as string },
    });

    if (!existing || existing.userId !== req.user!.id) {
      throw new ApiError(404, "Record not found");
    }

    const updated = await prisma.financialRecord.update({
      where: { id:id as string },
      data: req.body,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Record updated"));
  }
);

// Delete Record (soft delete)
export const deleteRecord = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

   const existing = await prisma.financialRecord.findFirst({
  where: {
    id: id as string,
    deletedAt: null,
    },
    });

    if (!existing) {
    throw new ApiError(404, "Record not found");
    }

    if (
    existing.userId !== req.user!.id &&
    req.user!.role.name !== "ADMIN"
    ) {
    throw new ApiError(403, "Forbidden");
    }

    await prisma.financialRecord.update({
      where: { id:id as string },
      data: {
        deletedAt: new Date(),
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Record deleted"));
  }
);