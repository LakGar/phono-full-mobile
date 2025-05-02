import Joi from "joi";
import { logger } from "../utils/logger.js";

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      logger.warn("Validation Error:", {
        path: req.path,
        method: req.method,
        errors: error.details,
      });

      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: error.details.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    next();
  };
};

// Validation schemas
export const postSchema = Joi.object({
  content: Joi.string().required().min(1).max(1000),
  image: Joi.string().uri().allow(null, ""),
});

export const commentSchema = Joi.object({
  content: Joi.string().required().min(1).max(500),
});

export const userPreferencesSchema = Joi.object({
  theme: Joi.string().valid("light", "dark").default("light"),
  notifications: Joi.object({
    email: Joi.boolean().default(true),
    push: Joi.boolean().default(true),
  }).default({ email: true, push: true }),
  privacy: Joi.object({
    profileVisibility: Joi.string()
      .valid("public", "private")
      .default("public"),
    showEmail: Joi.boolean().default(false),
  }).default({ profileVisibility: "public", showEmail: false }),
});

export default validate;
