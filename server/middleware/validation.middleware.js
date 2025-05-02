export const validateComment = (req, res, next) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      message: "Comment content is required",
    });
  }

  if (content.length > 1000) {
    return res.status(400).json({
      message: "Comment content must be less than 1000 characters",
    });
  }

  req.body.content = content.trim();
  next();
};
