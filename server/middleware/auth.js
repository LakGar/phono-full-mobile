import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";

// Role-based access control middleware
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// Authentication middleware
export const authenticate = (req, res, next) => {
  try {
    logger.info("Auth middleware - checking token");
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn("No authorization header found");
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    logger.info("Token found:", token ? "yes" : "no");

    if (!token) {
      logger.warn("Token not found in auth header");
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.info("Token decoded successfully:", decoded);
      req.user = { ...decoded };
      logger.info("User set in request:", req.user);
      next();
    } catch (error) {
      logger.warn("Token verification failed:", error);
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    logger.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};
