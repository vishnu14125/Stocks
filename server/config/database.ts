import mongoose from "mongoose";
import { config } from "dotenv";

config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL ||
  "mongodb://localhost:27017/stocktracker";

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("🚨 MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🔌 MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🛑 MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("🚨 MongoDB connection failed:", error);
    console.log("⚠️  Running in development mode without MongoDB");
    console.log("💡 To use MongoDB features:");
    console.log(
      "   1. Install MongoDB: https://docs.mongodb.com/manual/installation/",
    );
    console.log("   2. Start MongoDB: mongod");
    console.log("   3. Or use MongoDB Atlas: https://cloud.mongodb.com");
    console.log("\n✅ App will continue with localStorage functionality");

    // Don't exit in development mode
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log("🔌 MongoDB disconnected");
  } catch (error) {
    console.error("🚨 Error disconnecting from MongoDB:", error);
  }
};

// Database health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    const state = mongoose.connection.readyState;
    return state === 1; // 1 = connected
  } catch (error) {
    console.error("🚨 Database health check failed:", error);
    return false;
  }
};
