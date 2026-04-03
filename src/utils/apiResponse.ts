import type { Response } from "express";

interface ISuccessResponse {
  success: boolean;
  message: string;
  data: any;
}

interface IErrorResponse {
  success: boolean;
  message: string;
  error?: any;
}

interface IApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: any;
}

export const successResponse = (
  res: Response,
  data: any,
  message: string = "Success",
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string = "Something went wrong",
  statusCode: number = 500,
  error: any = null
): Response => {
  const body: IErrorResponse = {
    success: false,
    message,
  };

  if (error) body.error = error;

  return res.status(statusCode).json(body);
};

class ApiResponse implements IApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: any;

  constructor(statusCode: number, data: any, message: string = "Success") {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export { ApiResponse };