import Collection from "../models/collection.model.js";
import { generateDescriptionCollection } from "../service/openAI.js";
import User from "../models/user.model.js";
import Record from "../models/record.model.js";
import { logger } from "../utils/logger.js";
import { createRecord } from "./record.controller.js";

export const createCollection = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Collection name is required",
      });
    }

    const collection = await Collection.create({
      name: name,
      user: user._id,
      records: [],
    });

    user.collections.push(collection._id);
    await user.save();

    res.status(201).json({ success: true, collection });
  } catch (error) {
    console.error("Error creating collection:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create collection" });
  }
};

export const addRecordToCollection = async (req, res) => {
  try {
    const { collectionId, recordId } = req.params;
    logger.info("Starting addRecordToCollection", {
      collectionId,
      recordId,
      userId: req.user.userId,
    });

    // Check if collection exists and belongs to user
    const collection = await Collection.findOne({
      _id: collectionId,
      user: req.user.userId,
    }).populate("records");

    if (!collection) {
      logger.warn("Collection not found or unauthorized", {
        collectionId,
        userId: req.user.userId,
      });
      return res
        .status(404)
        .json({ success: false, message: "Collection not found" });
    }

    // Check if record exists
    let record = await Record.findOne({ _id: recordId });
    logger.info("Record lookup result", {
      recordId,
      found: !!record,
    });

    if (!record) {
      logger.warn("Record not found", { recordId });
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });
    }

    // Check if record is already in collection
    const isRecordInCollection = collection.records.some(
      (r) => r.discogsId === record.discogsId
    );
    logger.info("Record collection status", {
      recordId,
      collectionId,
      isRecordInCollection,
    });

    if (isRecordInCollection) {
      logger.info("Record already in collection", {
        recordId,
        collectionId,
      });
      return res.status(200).json({
        success: true,
        message: "Record already exists in collection",
        collection: collection,
      });
    }

    // Add record to collection
    collection.records.push(record._id);
    logger.info("Added record to collection", {
      recordId,
      collectionId,
    });

    // Update collection metadata using OpenAI
    try {
      const collectionRecords = await Record.find({
        _id: { $in: collection.records },
      });

      const collectionMetadata = await generateDescriptionCollection(
        collectionRecords,
        collection.genre || [],
        collection.mood || []
      );

      collection.description = collectionMetadata.description;
      collection.genre = collectionMetadata.genres;
      collection.mood = collectionMetadata.moods;

      logger.info("Updated collection metadata", {
        collectionId,
        metadata: collectionMetadata,
      });
    } catch (openAIError) {
      logger.error("OpenAI API Error for collection metadata:", openAIError);
      // Keep existing metadata if OpenAI fails
    }

    await collection.save();
    logger.info("Collection saved successfully", {
      collectionId,
      recordCount: collection.records.length,
    });

    res.json({
      success: true,
      message: "Record added to collection successfully",
      collection,
    });
  } catch (error) {
    logger.error("Error in addRecordToCollection:", {
      error: error.message,
      stack: error.stack,
      collectionId: req.params.collectionId,
      recordId: req.params.recordId,
    });
    res.status(500).json({
      success: false,
      message: "Failed to add record to collection",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getCollections = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const collections = await Collection.find({
      user: user._id,
    }).populate("records");
    res.json({ success: true, collections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch collections" });
  }
};

export const getCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;

    // Verify user exists
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const collection = await Collection.findById(collectionId).populate(
      "records",
      "name artist image genre mood year description"
    );

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized: You don't own this collection",
      });
    }

    res.status(200).json(collection);
  } catch (error) {
    console.error("Error getting collection:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteRecordFromCollection = async (req, res) => {
  try {
    const { collectionId, recordId } = req.params;

    // Verify user exists
    const user = await User.findById(req.user.userId);
    if (!user) {
      logger.error("User not found", { userId: req.user.userId });
      return res.status(404).json({ message: "User not found" });
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      logger.error("Collection not found", { collectionId });
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.user.toString() !== user._id.toString()) {
      logger.error("Unauthorized: You don't own this collection", {
        collectionId,
        userId: req.user.userId,
      });
      return res.status(403).json({
        message: "Unauthorized: You don't own this collection",
      });
    }

    // Check if record exists in collection
    const recordIndex = collection.records.indexOf(recordId);
    if (recordIndex === -1) {
      logger.error("Record not found in collection", {
        collectionId,
        recordId,
      });
      return res.status(404).json({
        message: "Record not found in collection",
      });
    }

    // Remove record and update collection
    collection.records.splice(recordIndex, 1);

    // Update collection metadata if there are still records
    if (collection.records.length > 0) {
      const { description, mood, genre } = await generateDescriptionCollection(
        collection.records
      );
      collection.description = description;
      collection.mood = mood;
      collection.genre = genre;
    } else {
      // Reset metadata if collection is empty
      collection.description = null;
      collection.mood = [];
      collection.genre = [];
    }

    await collection.save();
    logger.info("Collection saved successfully", {
      collectionId,
      recordCount: collection.records.length,
    });

    res.status(200).json({
      message: "Record removed successfully",
      collection,
    });
  } catch (error) {
    console.error("Error deleting record from collection:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const updateCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { name, description, image } = req.body;

    // Verify user exists
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized: You don't own this collection",
      });
    }

    // Update fields if provided
    if (name) collection.name = name.trim();
    if (description) collection.description = description;
    if (image) collection.image = image;

    collection.updatedAt = new Date();
    await collection.save();

    res.status(200).json({
      message: "Collection updated successfully",
      collection,
    });
  } catch (error) {
    console.error("Error updating collection:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;

    // Verify user exists
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized: You don't own this collection",
      });
    }

    await Collection.deleteOne({ _id: collectionId });

    res.status(200).json({
      message: "Collection deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting collection:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getCollectionStats = async (req, res) => {
  try {
    const { collectionId } = req.params;

    // Verify user exists
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const collection = await Collection.findById(collectionId).populate(
      "records",
      "genre mood year"
    );

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized: You don't own this collection",
      });
    }

    // Calculate statistics
    const stats = {
      totalRecords: collection.records.length,
      genres: {},
      moods: {},
      years: {},
      oldestRecord: null,
      newestRecord: null,
    };

    collection.records.forEach((record) => {
      // Count genres
      if (record.genre) {
        stats.genres[record.genre] = (stats.genres[record.genre] || 0) + 1;
      }

      // Count moods
      if (record.mood) {
        stats.moods[record.mood] = (stats.moods[record.mood] || 0) + 1;
      }

      // Count years
      if (record.year) {
        stats.years[record.year] = (stats.years[record.year] || 0) + 1;

        // Update oldest/newest
        if (!stats.oldestRecord || record.year < stats.oldestRecord) {
          stats.oldestRecord = record.year;
        }
        if (!stats.newestRecord || record.year > stats.newestRecord) {
          stats.newestRecord = record.year;
        }
      }
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting collection stats:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
