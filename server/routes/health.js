import express from "express";
import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { getHealth } from "../controllers/health.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Get server health status
 *     description: Returns the current health status of the server including uptime, database connection, and memory usage
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-03-20T12:34:56.789Z"
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [connected, disconnected]
 *                       example: "connected"
 *                 memory:
 *                   type: object
 *                   properties:
 *                     rss:
 *                       type: number
 *                       description: Resident Set Size
 *                       example: 12345678
 *                     heapTotal:
 *                       type: number
 *                       description: Total heap size
 *                       example: 23456789
 *                     heapUsed:
 *                       type: number
 *                       description: Used heap size
 *                       example: 1234567
 *       500:
 *         description: Server is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */
router.get("/", getHealth);

export default router;
