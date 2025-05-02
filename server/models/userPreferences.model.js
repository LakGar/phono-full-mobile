import mongoose from "mongoose";

const userPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  theme: {
    type: String,
    enum: ["light", "dark"],
    default: "light",
  },
  notifications: {
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
    marketing: {
      type: Boolean,
      default: false,
    },
    updates: {
      type: Boolean,
      default: true,
    },
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    showEmail: {
      type: Boolean,
      default: false,
    },
    showLikes: {
      type: Boolean,
      default: true,
    },
    showCollections: {
      type: Boolean,
      default: true,
    },
  },
  musicPreferences: {
    likedGenres: {
      type: [String],
      default: [],
    },
    dislikedGenres: {
      type: [String],
      default: [],
    },
    likedArtists: {
      type: [String],
      default: [],
    },
    dislikedArtists: {
      type: [String],
      default: [],
    },
    likedRecords: {
      type: [String],
      default: [],
    },
    dislikedRecords: {
      type: [String],
      default: [],
    },
  },
  display: {
    gridSize: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },
    sortBy: {
      type: String,
      enum: ["date", "name", "artist", "genre"],
      default: "date",
    },
    order: {
      type: String,
      enum: ["asc", "desc"],
      default: "desc",
    },
    showDetails: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add a pre-save middleware to update the updatedAt timestamp
userPreferencesSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const UserPreferences = mongoose.model(
  "UserPreferences",
  userPreferencesSchema
);

export default UserPreferences;
