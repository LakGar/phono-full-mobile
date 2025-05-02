import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    // Validate required fields
    if (!content) {
      return res.status(400).json({
        message: "Content is required",
      });
    }

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create comment
    const comment = await Comment.create({
      content: content.trim(),
      user: req.user.userId,
      post: postId,
    });

    // Add comment to post
    post.comments.push(comment._id);
    await post.save();

    // Populate user data
    await comment.populate("user", "username profilePicture");

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get comments for a post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Convert both IDs to strings for comparison
    const commentUserId = comment.user ? comment.user.toString() : null;
    const requestUserId = req.user.userId ? req.user.userId.toString() : null;

    if (!commentUserId || !requestUserId || commentUserId !== requestUserId) {
      return res.status(403).json({
        message: "Unauthorized: You don't own this comment",
      });
    }

    comment.content = content.trim();
    comment.updatedAt = new Date();
    await comment.save();

    // Populate user data for response
    await comment.populate("user", "username profilePicture");

    res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Convert both IDs to strings for comparison
    const commentUserId = comment.user ? comment.user.toString() : null;
    const requestUserId = req.user.userId ? req.user.userId.toString() : null;

    if (!commentUserId || !requestUserId || commentUserId !== requestUserId) {
      return res.status(403).json({
        message: "Unauthorized: You don't own this comment",
      });
    }

    // Remove comment from post
    const post = await Post.findById(comment.post);
    if (post) {
      post.comments = post.comments.filter((id) => id.toString() !== commentId);
      await post.save();
    }

    await Comment.deleteOne({ _id: commentId });

    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
 