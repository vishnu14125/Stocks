import { Router, Request, Response } from "express";
import { User } from "../models/User";
import {
  generateToken,
  authenticateToken,
  AuthRequest,
} from "../middleware/auth";
import { body, validationResult } from "express-validator";

const router = Router();

// Validation rules
const registerValidation = [
  body("username")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  body("firstName").optional().trim().isLength({ max: 50 }),
  body("lastName").optional().trim().isLength({ max: 50 }),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Register new user
router.post(
  "/register",
  registerValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const { username, email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message:
            existingUser.email === email
              ? "Email already registered"
              : "Username already taken",
        });
        return;
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName,
        preferences: {
          theme: "system",
          currency: "USD",
          refreshInterval: 60,
          notifications: true,
          priceAlerts: false,
        },
      });

      await user.save();

      // Generate JWT token
      const token = generateToken(user._id.toString(), user.email);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            preferences: user.preferences,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
      });
    }
  },
);

// Login user
router.post(
  "/login",
  loginValidation,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // Generate JWT token
      const token = generateToken(user._id.toString(), user.email);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            preferences: user.preferences,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
      });
    }
  },
);

// Get current user profile
router.get(
  "/me",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      res.json({
        success: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get user profile",
      });
    }
  },
);

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("firstName").optional().trim().isLength({ max: 50 }),
    body("lastName").optional().trim().isLength({ max: 50 }),
    body("preferences.theme").optional().isIn(["light", "dark", "system"]),
    body("preferences.currency").optional().isIn(["USD", "EUR", "INR"]),
    body("preferences.refreshInterval").optional().isInt({ min: 30, max: 300 }),
    body("preferences.notifications").optional().isBoolean(),
    body("preferences.priceAlerts").optional().isBoolean(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const allowedUpdates = ["firstName", "lastName", "preferences"];
      const updates = Object.keys(req.body)
        .filter((key) => allowedUpdates.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      const user = await User.findByIdAndUpdate(req.userId, updates, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  },
);

// Change password
router.put(
  "/change-password",
  authenticateToken,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "New password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid =
        await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
        return;
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to change password",
      });
    }
  },
);

// Logout (client-side token removal)
router.post(
  "/logout",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      message: "Logout successful",
    });
  },
);

export default router;
