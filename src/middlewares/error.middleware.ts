import type { Request, Response, NextFunction } from "express";
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error("[Error]", err.stack || err.message || err);

  // Prisma known request errors
  if (err.code === "P2025") {
    res.status(404).json({ success: false, message: "Record not found." });
    return;
  }

  if (err.code === "P2002") {
    res.status(409).json({
      success: false,
      message: "A record with that unique value already exists.",
      error: err.meta?.target,
    });
    return;
  }

  const statusCode: number = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error.",
  });
}
