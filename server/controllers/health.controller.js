import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export const getHealth = async (req, res) => {
  const healthcheck = {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    healthcheck.database = {
      status: dbState === 1 ? "connected" : "disconnected",
    };

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    healthcheck.memory = {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
    };

    // Check if we can perform a simple database operation
    if (dbState === 1) {
      await mongoose.connection.db.admin().ping();
      logger.info("Health check successful - Database ping successful");
    } else {
      logger.warn("Health check warning - Database is disconnected");
    }

    res.status(200).json(healthcheck);
  } catch (error) {
    logger.error("Health check failed:", error);
    healthcheck.status = "error";
    healthcheck.error = error.message;
    res.status(500).json(healthcheck);
  }
};
