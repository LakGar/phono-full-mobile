import { logger } from "../utils/logger.js";

export const paginate = (model) => {
  return async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sort = req.query.sort || "-createdAt"; // Default sort by newest first
      const select = req.query.select || ""; // Fields to select
      const populate = req.query.populate || ""; // Relations to populate

      // Calculate skip value
      const skip = (page - 1) * limit;

      // Build query
      let query = model.find(req.filter || {});

      // Apply sorting
      if (sort) {
        query = query.sort(sort);
      }

      // Apply field selection
      if (select) {
        query = query.select(select);
      }

      // Apply population
      if (populate) {
        const populateOptions = populate.split(",").map((field) => ({
          path: field,
          select: "-__v", // Exclude version field from populated documents
        }));
        query = query.populate(populateOptions);
      }

      // Execute query with pagination
      const [results, total] = await Promise.all([
        query.skip(skip).limit(limit).lean(),
        model.countDocuments(req.filter || {}),
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Add pagination metadata to response
      res.paginatedResults = {
        success: true,
        data: results,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      };

      logger.debug(
        `Pagination applied: page ${page}, limit ${limit}, total ${total}`
      );

      next();
    } catch (error) {
      logger.error("Pagination error:", error);
      next(error);
    }
  };
};

// Helper function to format pagination links
export const getPaginationLinks = (req, pagination) => {
  const { page, limit, totalPages } = pagination;
  const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${
    req.path
  }`;

  const links = {
    self: `${baseUrl}?page=${page}&limit=${limit}`,
    first: `${baseUrl}?page=1&limit=${limit}`,
    last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
  };

  if (page < totalPages) {
    links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
  }

  if (page > 1) {
    links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
  }

  return links;
};
