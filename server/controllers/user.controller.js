import User from "../models/user.model.js";
import { logger } from "../utils/logger.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/email.js";
import crypto from "crypto";
import Collection from "../models/collection.model.js";
import Record from "../models/record.model.js";

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationToken = jwt.sign(
      { code: verificationCode },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Create new user
    const user = await User.create({
      name,
      username,
      email,
      password,
      isVerified: false,
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode);

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email for the verification code.",
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: user.getPublicProfile(),
        token,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Verify email with code
export const verifyEmail = async (req, res) => {
  console.log("Verifying email");
  try {
    const { email, code } = req.body;
    console.log("Email:", email);
    console.log("Code:", code);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      console.log("Email already verified");
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // Check if verification token exists
    if (!user.verificationToken) {
      console.log("No verification token found");
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new code.",
      });
    }

    // Verify and decode the token
    try {
      const decoded = jwt.verify(
        user.verificationToken,
        process.env.JWT_SECRET
      );
      console.log("Decoded token:", decoded);

      // Compare the submitted code with the code in the token
      const submittedCode = code.toString().padStart(6, "0");
      const storedCode = decoded.code.toString().padStart(6, "0");

      console.log("Submitted code:", submittedCode);
      console.log("Stored code:", storedCode);

      if (submittedCode !== storedCode) {
        console.log("Invalid verification code");
        return res.status(400).json({
          success: false,
          message: "Invalid verification code",
        });
      }
    } catch (tokenError) {
      console.log("Token verification failed:", tokenError);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired or is invalid",
      });
    }

    // Check if token is expired
    if (user.verificationTokenExpiresAt < new Date()) {
      console.log("Verification code has expired");
      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiresAt = null;
    await user.save();

    logger.info(`User email verified: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    logger.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying email",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Resend verification code
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // Generate new verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationToken = jwt.sign(
      { code: verificationCode },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Update user with new verification code
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode);

    logger.info(`Verification code resent to: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    logger.error("Resend verification code error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending verification code",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user.getPublicProfile(),
    });
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { username, email, profile, profilePicture, bio } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if new email or username is already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Username already in use",
        });
      }
    }

    // Update user with all provided fields
    const updateData = {
      ...(username && { username }),
      ...(email && { email }),
      ...(profile && { profile }),
      ...(profilePicture && { profilePicture }),
      ...(bio && { bio }),
    };

    Object.assign(user, updateData);
    await user.save();

    logger.info(`User profile updated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user.getPublicProfile(),
    });
  } catch (error) {
    logger.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Add album to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { recordData } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if album is already in wishlist
    if (user.wishlist.includes(recordData.id)) {
      return res.status(400).json({
        success: false,
        message: "Album already in wishlist",
      });
    }

    // Add album to wishlist
    user.wishlist.push(recordData.id);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Album added to wishlist successfully",
      data: {
        wishlist: user.wishlist,
      },
    });
  } catch (error) {
    logger.error("Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding album to wishlist",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Remove album from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { recordData } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if album is in wishlist
    if (!user.wishlist.includes(recordData.id)) {
      return res.status(400).json({
        success: false,
        message: "Album not in wishlist",
      });
    }

    // Remove album from wishlist
    user.wishlist = user.wishlist.filter((id) => id !== recordData.id);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Album removed from wishlist successfully",
      data: {
        wishlist: user.wishlist,
      },
    });
  } catch (error) {
    logger.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing album from wishlist",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
