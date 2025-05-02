import NodeCache from "node-cache";
import { logger } from "../utils/logger.js";

const cache = new NodeCache({
  stdTTL: 600, // Default time-to-live: 10 minutes
  checkperiod: 120, // Check for expired keys every 2 minutes
});

export const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      logger.debug(`Cache hit for ${key}`);
      return res.json(cachedResponse);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      logger.debug(`Cache set for ${key}`);
      return originalJson.call(res, body);
    };

    next();
  };
};

// Clear cache for a specific route
export const clearCache = (key) => {
  cache.del(key);
  logger.info(`Cache cleared for ${key}`);
};

// Clear entire cache
export const clearAllCache = () => {
  cache.flushAll();
  logger.info("All cache cleared");
};

export default cache;
