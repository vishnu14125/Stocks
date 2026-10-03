import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../models/User";

// No 'as string' here, let it be string | undefined
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Throw if secret missing - after this check, JWT_SECRET is definitely string
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables.");
}

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
  // JWT_SECRET is now guaranteed to be string here
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Middleware: Verify JWT token
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ success: false, message: "Access token required" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: "Token expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: "Invalid token" });
    } else {
      console.error("Auth middleware error:", error);
      res.status(500).json({ success: false, message: "Authentication failed" });
    }
  }
};

// Optional authentication middleware
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
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
  } catch {
    next(); // Continue without blocking
  }
};

// Refresh token endpoint
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401).json({ success: false, message: "Refresh token required" });
      return;
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as JWTPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
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
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};

// Utility: Get userId from token
export const getUserIdFromToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded.userId;
  } catch {
    return null;
  }
};
