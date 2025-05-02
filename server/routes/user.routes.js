import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  verifyEmail,
  resendVerificationEmail,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/user.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import validate from "../middleware/validator.js";
import { paginate } from "../middleware/pagination.js";
import { cacheMiddleware } from "../middleware/cache.js";
import {
  verificationLimiter,
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
} from "../middleware/rateLimiter.js";
import Joi from "joi";
import User from "../models/user.model.js";

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  profile: Joi.object({
    bio: Joi.string().max(500),
    avatar: Joi.string(),
    location: Joi.string(),
  }),
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
});

const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       409:
 *         description: User already exists
 *         $ref: '#/components/schemas/Error'
 */
router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  registerUser
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *         $ref: '#/components/schemas/Error'
 */
router.post("/login", loginLimiter, validate(loginSchema), loginUser);

/**
 * @swagger
 * /api/users/verify-email:
 *   post:
 *     summary: Verify email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 length: 6
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid email or code
 */
router.post(
  "/verify-email",
  verificationLimiter,
  validate(verifyEmailSchema),
  verifyEmail
);

/**
 * @swagger
 * /api/users/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       400:
 *         description: Invalid email
 */
router.post(
  "/resend-verification",
  verificationLimiter,
  validate(resendVerificationSchema),
  resendVerificationEmail
);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         $ref: '#/components/schemas/Error'
 */
router.get("/profile/me", authenticate, cacheMiddleware(300), getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               profile:
 *                 type: object
 *                 properties:
 *                   bio:
 *                     type: string
 *                     maxLength: 500
 *                   avatar:
 *                     type: string
 *                   location:
 *                     type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email or username already in use
 *         $ref: '#/components/schemas/Error'
 */
router.put(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  updateUserProfile
);

/**
 * @swagger
 * /api/users/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Retrieve a paginated list of all users. Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: "-createdAt"
 *         description: Sort field and direction (e.g., "-createdAt" for descending)
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Fields to select (comma-separated)
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *         description: Fields to populate (comma-separated)
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                 links:
 *                   type: object
 *                   properties:
 *                     first:
 *                       type: string
 *                       example: "/api/users/admin/users?page=1&limit=10"
 *                     prev:
 *                       type: string
 *                       example: null
 *                     next:
 *                       type: string
 *                       example: "/api/users/admin/users?page=2&limit=10"
 *                     last:
 *                       type: string
 *                       example: "/api/users/admin/users?page=10&limit=10"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (not an admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/admin/users",
  authenticate,
  requireRole(["admin"]),
  paginate(User),
  cacheMiddleware(60) // Cache for 1 minute
);

/**
 * @swagger
 * /api/users/wishlist:
 *   post:
 *     summary: Add album to wishlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recordData
 *             properties:
 *               recordData:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   artist:
 *                     type: string
 *                   coverImage:
 *                     type: string
 *                   year:
 *                     type: number
 *                   genre:
 *                     type: string
 *     responses:
 *       200:
 *         description: Album added to wishlist successfully
 *       400:
 *         description: Album already in wishlist
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post("/wishlist", authenticate, addToWishlist);

/**
 * @swagger
 * /api/users/wishlist:
 *   delete:
 *     summary: Remove album from wishlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recordData
 *             properties:
 *               recordData:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   artist:
 *                     type: string
 *                   coverImage:
 *                     type: string
 *                   year:
 *                     type: number
 *                   genre:
 *                     type: string
 *     responses:
 *       200:
 *         description: Album removed from wishlist successfully
 *       400:
 *         description: Album not in wishlist
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete("/wishlist", authenticate, removeFromWishlist);

export default router;
