import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase, checkDatabaseHealth } from "./config/database";
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";
import portfolioRoutes from "./routes/portfolio";
import watchlistRoutes from "./routes/watchlist";
import stocksRoutes from "./routes/stocks";

export function createServer() {
  const app = express();

  connectDatabase();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:8080",
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  app.get("/api/health", async (_req, res) => {
    const dbHealthy = await checkDatabaseHealth();
    res.status(dbHealthy ? 200 : 503).json({
      status: dbHealthy ? "healthy" : "unhealthy",
      database: dbHealthy ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ success: true, message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.use("/api/auth", authRoutes);
  app.use("/api/portfolio", portfolioRoutes);
  app.use("/api/watchlist", watchlistRoutes);
  app.use("/api/stocks", stocksRoutes);

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(err.errors).map((e: any) => e.message)
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    });
  });

  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.path}`
    });
  });

  return app;
}
