import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../models/User";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Generate JWT token
export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token middleware
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token required",
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Fetch user from database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Token expired",
      });
    } else {
      console.error("Auth middleware error:", error);
      res.status(500).json({
        success: false,
        message: "Authentication failed",
      });
    }
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      const user = await User.findById(decoded.userId).select("-password");

      if (user) {
        req.user = user;
        req.userId = decoded.userId;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Refresh token
export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
      return;
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as JWTPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const newToken = generateToken(user._id.toString(), user.email);

    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          preferences: user.preferences,
        },
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

// Extract user ID from token (utility function)
export const getUserIdFromToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded.userId;
  } catch {
    return null;
  }
};
