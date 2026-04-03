import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import  prisma  from "../utils/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import type { Request, Response } from "express";
import type { User, Role } from "@prisma/client";

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: User & { role: Role };
}

// Generate JWT

const generateToken = (user: User & { role: Role }) => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  const expiry = process.env.ACCESS_TOKEN_EXPIRY;

  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }

  return jwt.sign(
    { id: user.id, role: user.role.name },
    secret,
    { expiresIn: expiry as jwt.SignOptions["expiresIn"] || "1d" }
  );
};

// Register
export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      throw new ApiError(400, "All fields are required");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let role = await prisma.role.findFirst({
      where: { name: "VIEWER" },
    });
  if (!role) {
  role = await prisma.role.create({
    data: {
      name: "VIEWER",
      description: "Default role",
    },
  });
}
   const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    displayName,
    roleId: role.id,
  },
  include: { role: true },
});

const { password: _, ...safeUser } = user;

return res.status(201).json(
  new ApiResponse(201, safeUser, "User registered successfully")
);
  }
);

// Login
export const loginUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = generateToken(user);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          token,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role.name,
          },
        },
        "User logged in successfully"
      )
    );
  }
);

// Get current user
export const getCurrentUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "Current user fetched"));
  }
);

// Update user
export const updateUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { displayName } = req.body;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { displayName },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "User updated successfully"));
  }
);