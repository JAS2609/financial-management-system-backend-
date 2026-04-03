import type{ Request, Response } from "express";
import prisma  from "../utils/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

//SUMMARY (Income, Expense, Balance)
export const getSummary = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { from, to } = req.query;

    const where: any = {
      userId,
      deletedAt: null,
    };

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from as string);
      if (to) where.date.lte = new Date(to as string);
    }

    const incomeAgg = await prisma.financialRecord.aggregate({
      where: { ...where, type: "INCOME" },
      _sum: { amount: true },
    });

    const expenseAgg = await prisma.financialRecord.aggregate({
      where: { ...where, type: "EXPENSE" },
      _sum: { amount: true },
    });

    const totalIncome = Number(incomeAgg._sum.amount || 0);
    const totalExpense = Number(expenseAgg._sum.amount || 0);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
        },
        "Summary fetched"
      )
    );
  }
);

// CATEGORY BREAKDOWN
export const getCategoryBreakdown = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { from, to } = req.query;

    const where: any = {
      userId,
      deletedAt: null,
    };

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from as string);
      if (to) where.date.lte = new Date(to as string);
    }

    const grouped = await prisma.financialRecord.groupBy({
      by: ["category"],
      where,
      _sum: {
        amount: true,
      },
    });

    return res.status(200).json(
      new ApiResponse(200, grouped, "Category breakdown fetched")
    );
  }
);

//RECENT ACTIVITY
export const getRecentActivity = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 5);

    const records = await prisma.financialRecord.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        date: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          page,
          limit,
          records,
        },
        "Recent activity fetched"
      )
    );
  }
);

//MONTHLY TRENDS
export const getMonthlyTrends = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const records = await prisma.financialRecord.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    const trends: Record<string, { income: number; expense: number }> = {};

    records.forEach((r) => {
      const date = new Date(r.date);
      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!trends[key]) {
        trends[key] = { income: 0, expense: 0 };
      }

      const amount = Number(r.amount);

      if (r.type === "INCOME") trends[key].income += amount;
      if (r.type === "EXPENSE") trends[key].expense += amount;
    });

    return res
      .status(200)
      .json(new ApiResponse(200, trends, "Monthly trends fetched"));
  }
);