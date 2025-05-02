import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { logger } from "./utils/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import securityMiddleware from "./middleware/security.js";
import {
  apiLimiter,
  authLimiter,
  strictLimiter,
} from "./middleware/rateLimiter.js";
import routes from "./routes/index.js";
import specs from "./config/swagger.js";
import connectDB from "./config/db.js";

// Verify environment variables
if (!process.env.OPENAI_API_KEY) {
  logger.error("OPENAI_API_KEY is not set in environment variables");
  process.exit(1);
}

const app = express();

// Security middleware
securityMiddleware(app);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Routes
app.use("/api", routes);

// Rate limiting
app.use("/api/auth", authLimiter); // Stricter limits for auth routes
app.use("/api", apiLimiter); // General API limits
app.use("/api/posts", strictLimiter); // Stricter limits for post-related routes

// API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Phono API Documentation",
  })
);

// Error handling
app.use(errorHandler);

// Database connection
connectDB();

// Server startup
const PORT = process.env.PORT;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully");
  mongoose.connection.close(() => {
    logger.info("MongoDB connection closed");
    process.exit(0);
  });
});

export default app;
