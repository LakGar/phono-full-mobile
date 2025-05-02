import UserPreferences from "../models/userPreferences.model.js";
import User from "../models/user.model.js";
import { logger } from "../utils/logger.js";

// Get user preferences
export const getUserPreferences = async (req, res) => {
  try {
    logger.info("Received request for user preferences");
    logger.info("User from token:", req.user);

    // First verify that the user exists
    const user = await User.findById(req.user.userId);
    logger.info("Found user:", user ? "yes" : "no");

    if (!user) {
      logger.warn(`User not found with ID: ${req.user.userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Try to find existing preferences
    const preferences = await UserPreferences.findOne({ user: req.user.userId })
      .populate("user", "username email")
      .lean();

    logger.info("Found preferences:", preferences ? "yes" : "no");

    if (!preferences) {
      logger.info(`Creating default preferences for user ${req.user.userId}`);
      // Create default preferences with the user ID
      const defaultPreferences = await UserPreferences.create({
        user: req.user.userId,
        theme: "dark",
        notifications: {
          email: true,
          push: true,
          marketing: false,
          updates: true,
        },
        privacy: {
          profileVisibility: "public",
          showEmail: false,
          showLikes: true,
          showCollections: true,
        },
        musicPreferences: {
          likedGenres: [],
          dislikedGenres: [],
          likedArtists: [],
          dislikedArtists: [],
          likedRecords: [],
          dislikedRecords: [],
        },
        display: {
          gridSize: "medium",
          sortBy: "date",
          order: "desc",
          showDetails: true,
        },
      });

      // Update user's preferences reference
      await User.findByIdAndUpdate(req.user.userId, {
        userPreferences: defaultPreferences._id,
      });

      return res.status(200).json({
        success: true,
        message: "Default preferences created",
        data: defaultPreferences,
      });
    }

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    logger.error("Error getting user preferences:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const { theme, notifications, privacy, musicPreferences, display } =
      req.body;

    logger.info("Updating preferences for user:", req.user.userId);

    // Verify user exists
    const user = await User.findById(req.user.userId);
    if (!user) {
      logger.warn(`User not found with ID: ${req.user.userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    let preferences = await UserPreferences.findOne({ user: req.user.userId });

    if (!preferences) {
      logger.info(`Creating preferences for user ${req.user.userId}`);
      preferences = await UserPreferences.create({
        user: req.user.userId,
        theme: theme || "dark",
        notifications: notifications || {
          email: true,
          push: true,
          marketing: false,
          updates: true,
        },
        privacy: privacy || {
          profileVisibility: "public",
          showEmail: false,
          showLikes: true,
          showCollections: true,
        },
        musicPreferences: musicPreferences || {
          likedGenres: [],
          dislikedGenres: [],
          likedArtists: [],
          dislikedArtists: [],
          likedRecords: [],
          dislikedRecords: [],
        },
        display: display || {
          gridSize: "medium",
          sortBy: "date",
          order: "desc",
          showDetails: true,
        },
      });

      // Update user's preferences reference
      await User.findByIdAndUpdate(req.user.userId, {
        userPreferences: preferences._id,
      });
    } else {
      if (theme) preferences.theme = theme;
      if (notifications) preferences.notifications = notifications;
      if (privacy) preferences.privacy = privacy;
      if (musicPreferences) preferences.musicPreferences = musicPreferences;
      if (display) preferences.display = display;

      preferences.updatedAt = new Date();
      await preferences.save();
    }

    logger.info(`Preferences updated for user ${req.user.userId}`);
    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: preferences,
    });
  } catch (error) {
    logger.error("Error updating user preferences:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Reset user preferences to default
export const resetUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const defaultPreferences = {
      theme: "light",
      notifications: {
        email: true,
        push: true,
        marketing: false,
        updates: true,
      },
      privacy: {
        profileVisibility: "public",
        showEmail: false,
        showLikes: true,
        showCollections: true,
      },
      musicPreferences: {
        likedGenres: [],
        dislikedGenres: [],
        likedArtists: [],
        dislikedArtists: [],
        likedRecords: [],
        dislikedRecords: [],
      },
      display: {
        gridSize: "medium",
        sortBy: "date",
        order: "desc",
        showDetails: true,
      },
    };

    await UserPreferences.findOneAndUpdate(
      { user: req.user._id },
      defaultPreferences,
      { upsert: true, new: true }
    );

    logger.info(`Preferences reset for user ${req.user._id}`);
    res.status(200).json({
      message: "Preferences reset successfully",
      preferences: defaultPreferences,
    });
  } catch (error) {
    logger.error("Error resetting user preferences:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update specific notification settings
export const updateNotificationSettings = async (req, res) => {
  try {
    const { type, enabled } = req.body;

    if (!type || typeof enabled !== "boolean") {
      return res.status(400).json({
        message: "Invalid notification settings",
      });
    }

    const preferences = await UserPreferences.findOne({ user: req.user._id });
    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    preferences.notifications[type] = enabled;
    preferences.updatedAt = new Date();
    await preferences.save();

    logger.info(`Notification settings updated for user ${req.user._id}`);
    res.status(200).json({
      message: "Notification settings updated successfully",
      notifications: preferences.notifications,
    });
  } catch (error) {
    logger.error("Error updating notification settings:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update music preferences
export const updateMusicPreferences = async (req, res) => {
  try {
    const { type, action, items } = req.body;

    if (!type || !action || !Array.isArray(items)) {
      return res.status(400).json({
        message: "Invalid music preferences update",
      });
    }

    const preferences = await UserPreferences.findOne({ user: req.user._id });
    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    const validTypes = ["genres", "artists", "records"];
    const validActions = ["add", "remove"];

    if (!validTypes.includes(type) || !validActions.includes(action)) {
      return res.status(400).json({
        message: "Invalid type or action",
      });
    }

    const field =
      type === "genres"
        ? "likedGenres"
        : type === "artists"
        ? "likedArtists"
        : "likedRecords";

    if (action === "add") {
      preferences.musicPreferences[field] = [
        ...new Set([...preferences.musicPreferences[field], ...items]),
      ];
    } else {
      preferences.musicPreferences[field] = preferences.musicPreferences[
        field
      ].filter((item) => !items.includes(item));
    }

    preferences.updatedAt = new Date();
    await preferences.save();

    logger.info(`Music preferences updated for user ${req.user._id}`);
    res.status(200).json({
      message: "Music preferences updated successfully",
      musicPreferences: preferences.musicPreferences,
    });
  } catch (error) {
    logger.error("Error updating music preferences:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update display settings
export const updateDisplaySettings = async (req, res) => {
  try {
    const { gridSize, sortBy, order, showDetails } = req.body;

    const preferences = await UserPreferences.findOne({ user: req.user._id });
    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    if (gridSize) preferences.display.gridSize = gridSize;
    if (sortBy) preferences.display.sortBy = sortBy;
    if (order) preferences.display.order = order;
    if (typeof showDetails === "boolean")
      preferences.display.showDetails = showDetails;

    preferences.updatedAt = new Date();
    await preferences.save();

    logger.info(`Display settings updated for user ${req.user._id}`);
    res.status(200).json({
      message: "Display settings updated successfully",
      display: preferences.display,
    });
  } catch (error) {
    logger.error("Error updating display settings:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
