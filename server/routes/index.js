import express from "express";
import { authenticate } from "../middleware/auth.js";
import userRoutes from "./user.routes.js";
import discogsRoutes from "./discogs.routes.js";
// Import controllers
import {
  createCollection,
  getCollections,
  getCollection,
  deleteRecordFromCollection,
  updateCollection,
  deleteCollection,
  getCollectionStats,
  addRecordToCollection,
} from "../controllers/collection.controller.js";

import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
} from "../controllers/post.controller.js";

import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

import {
  getUserPreferences,
  updateUserPreferences,
  resetUserPreferences,
  updateNotificationSettings,
  updateMusicPreferences,
  updateDisplaySettings,
} from "../controllers/userPreferences.controller.js";

import { createRecord, getRecords } from "../controllers/record.controller.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/discogs", discogsRoutes);
// Collection routes
router.post("/collections", authenticate, createCollection);
router.get("/collections", authenticate, getCollections);
router.get("/collections/:collectionId", authenticate, getCollection);
router.put("/collections/:collectionId", authenticate, updateCollection);
router.delete("/collections/:collectionId", authenticate, deleteCollection);
router.get(
  "/collections/:collectionId/stats",
  authenticate,
  getCollectionStats
);

// Collection record routes
router.post(
  "/collections/:collectionId/records/:recordId",
  authenticate,
  addRecordToCollection
);

router.delete(
  "/collections/:collectionId/records/:recordId",
  authenticate,
  deleteRecordFromCollection
);

// Record routes
router.post("/records", authenticate, createRecord);
router.get("/records", authenticate, getRecords);

// Post routes
router.post("/posts", authenticate, createPost);
router.get("/posts", authenticate, getPosts);
router.get("/posts/:postId", authenticate, getPost);
router.put("/posts/:postId", authenticate, updatePost);
router.delete("/posts/:postId", authenticate, deletePost);

// Post social routes
router.post("/posts/:postId/like", authenticate, toggleLike);

// Comment routes
router.post("/posts/:postId/comments", authenticate, createComment);
router.get("/posts/:postId/comments", authenticate, getComments);
router.put("/comments/:commentId", authenticate, updateComment);
router.delete("/comments/:commentId", authenticate, deleteComment);

// User preferences routes
router.get("/preferences", authenticate, getUserPreferences);
router.put("/preferences", authenticate, updateUserPreferences);
router.post("/preferences/reset", authenticate, resetUserPreferences);
router.put(
  "/preferences/notifications",
  authenticate,
  updateNotificationSettings
);
router.put("/preferences/music", authenticate, updateMusicPreferences);
router.put("/preferences/display", authenticate, updateDisplaySettings);

export default router;
