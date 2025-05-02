import Record from "../models/record.model.js";
import { generateDescriptionAlbum } from "../service/openAI.js";
import { logger } from "../utils/logger.js";

export const createRecord = async (req, res) => {
  try {
    // Validate required fields
    const { name, image, artist, discogsId } = req.body;
    if (!name || !artist || !discogsId) {
      logger.warn("Missing required fields for record creation", {
        name,
        artist,
        discogsId,
      });
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, artist, and discogsId are required",
      });
    }

    // Check for existing record
    const existingRecord = await Record.findOne({ discogsId });
    if (existingRecord) {
      logger.info("Record already exists", { discogsId });
      return res.status(200).json({
        success: true,
        message: "Record already exists",
        record: existingRecord,
      });
    }

    // Generate description and metadata
    let metadata;
    try {
      metadata = await generateDescriptionAlbum(name, artist);
    } catch (openAIError) {
      logger.error("OpenAI API Error:", openAIError);
      // Fallback to basic metadata if OpenAI fails
      metadata = {
        genre: null,
        mood: null,
        year: null,
        description: `A record by ${artist}`,
      };
    }

    // Create the record with all fields
    const record = await Record.create({
      name,
      description: metadata.description,
      image: image || null,
      artist,
      mood: metadata.mood,
      genre: metadata.genre,
      year: metadata.year,
      discogsId,
      user: req.user.userId,
      collections: [],
    });

    logger.info("Record created successfully", {
      recordId: record._id,
      discogsId,
    });

    // Return the created record
    res.status(201).json({
      success: true,
      message: "Record created successfully",
      record,
    });
  } catch (error) {
    logger.error("Error creating record:", error);

    // Handle specific error types
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getRecords = async (req, res) => {
  try {
    const records = await Record.find({ discogsId: req.body.recordId });
    res.status(200).json({ success: true, records });
  } catch (error) {
    logger.error("Error fetching records:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
