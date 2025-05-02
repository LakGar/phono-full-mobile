import nodemailer from "nodemailer";
import { logger } from "./logger.js";

// Create a transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "lakgarg2002@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD, // You'll need to set this in your environment
  },
});

// Verify transporter
transporter.verify(function (error, success) {
  if (error) {
    logger.error("SMTP connection error:", error);
  } else {
    logger.info("SMTP server is ready to take our messages");
  }
});

// Send verification email with code
export const sendVerificationEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: '"Phono App" <lakgarg2002@gmail.com>',
      to: email,
      subject: "Verify your Phono account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e54545;">Welcome to Phono!</h1>
          <p>Thanks for signing up! Please verify your email address to get started.</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
            <h2 style="color: #e54545; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h2>
          </div>
          <p>Enter this code in the app to verify your email address.</p>
          <p style="color: #666; font-size: 14px;">This code will expire in 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">If you didn't create an account with Phono, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Verification code sent to: ${email}`);
  } catch (error) {
    logger.error("Error sending verification email:", error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, token) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const mailOptions = {
      from: '"Phono App" <lakgarg2002@gmail.com>',
      to: email,
      subject: "Reset your Phono password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e54545;">Reset Your Password</h1>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #e54545; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">If you didn't request this password reset, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to: ${email}`);
  } catch (error) {
    logger.error("Error sending password reset email:", error);
    throw error;
  }
};
