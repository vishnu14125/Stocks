import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase, checkDatabaseHealth } from "./config/database";
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";
import portfolioRoutes from "./routes/portfolio";
import watchlistRoutes from "./routes/watchlist";
import { authenticateToken } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Connect to MongoDB (optional in development)
  connectDatabase().catch(() => {
    console.log("📍 Continuing without MongoDB - using localStorage fallback");
  });

  // Middleware
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:8080",
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // MongoDB availability middleware
  const checkMongoAvailable = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const dbHealthy = await checkDatabaseHealth();
    if (
      !dbHealthy &&
      req.path.startsWith("/api/") &&
      !req.path.includes("/health") &&
      !req.path.includes("/ping") &&
      !req.path.includes("/demo")
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Database temporarily unavailable. Please use localStorage features or try again later.",
        fallback: "localStorage",
      });
    }
    next();
  };

  // Health check endpoint
  app.get("/api/health", async (_req, res) => {
    const dbHealthy = await checkDatabaseHealth();
    res.status(200).json({
      // Always return 200 in development
      status: dbHealthy ? "healthy" : "development-mode",
      database: dbHealthy ? "connected" : "disconnected",
      fallback: dbHealthy ? "none" : "localStorage",
      timestamp: new Date().toISOString(),
    });
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ success: true, message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.use("/api/auth", authRoutes);

  // Protected routes (with optional MongoDB check)
  if (process.env.NODE_ENV === "production") {
    app.use("/api/portfolio", checkMongoAvailable, portfolioRoutes);
    app.use("/api/watchlist", checkMongoAvailable, watchlistRoutes);
  } else {
    // In development, show helpful message instead of blocking
    app.use("/api/portfolio", (req, res) => {
      res.status(200).json({
        success: false,
        message:
          "Portfolio API requires MongoDB. Install and start MongoDB, or use the frontend localStorage features.",
        setup: {
          install: "https://docs.mongodb.com/manual/installation/",
          start: "mongod",
          cloud: "https://cloud.mongodb.com",
        },
      });
    });
    app.use("/api/watchlist", (req, res) => {
      res.status(200).json({
        success: false,
        message:
          "Watchlist API requires MongoDB. Install and start MongoDB, or use the frontend localStorage features.",
        setup: {
          install: "https://docs.mongodb.com/manual/installation/",
          start: "mongod",
          cloud: "https://cloud.mongodb.com",
        },
      });
    });
  }

  // Error handling middleware
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("Error:", err);

      if (err.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: Object.values(err.errors).map((e: any) => e.message),
        });
      }

      if (err.name === "CastError") {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
      }

      res.status(500).json({
        success: false,
        message:
          process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message,
      });
    },
  );

  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.path}`,
    });
  });

  return app;
}
