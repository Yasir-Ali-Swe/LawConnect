import UserBaseModel from "../models/user-base-model.js";
import { generateJWT, getUserFromToken } from "../utils/make-jwt.js";
import { sendVerificationEmail } from "../utils/verification-email.js";
import { hashPassword, comparePassword } from "../utils/hash-password.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { FRONTEND_URL, NODE_ENV } from "../config/env.js";

export const registeration = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Validate password strength
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  if (!/\d/.test(password)) {
    throw new ApiError(400, "Password must contain at least one number");
  }

  if (!/[a-zA-Z]/.test(password)) {
    throw new ApiError(400, "Password must contain at least one letter");
  }

  const existingUser = await UserBaseModel.findOne({ email });

  if (existingUser && existingUser.isVerified) {
    throw new ApiError(
      400,
      "This email is already in use. If this is your email, please try logging in or resetting your password.",
    );
  }
  if (existingUser && !existingUser.isVerified) {
    // Existing unverified user - resend verification email
    console.warn(
      `[AUTH] Registration attempt with existing unverified email: ${email}. New password input was ignored; user should verify existing account first.`,
    );
    const token = generateJWT(
      existingUser._id,
      "15m",
      "emailVerification",
      existingUser.tokenVersion,
    );
    await sendVerificationEmail(email, token);
    return res.status(200).json({
      message: "Verification email resent. Please verify your email.",
      success: true,
    });
  }
  const hashedPassword = await hashPassword(password);
  const newUser = new UserBaseModel({
    fullName,
    email,
    password: hashedPassword,
    role,
  });
  await newUser.save();
  const token = generateJWT(
    newUser._id,
    "15m",
    "emailVerification",
    newUser.tokenVersion,
  );
  await sendVerificationEmail(email, token);
  res.status(201).json({
    message: "Registration successful. Please verify your email.",
    success: true,
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) {
    throw new ApiError(400, "Verification token is required");
  }
  const user = await getUserFromToken(token, "emailVerification");
  if (user.isVerified) {
    return res
      .status(200)
      .json({ message: "Email is already verified", success: true });
  }
  user.isVerified = true;
  await user.save();
  res
    .status(200)
    .json({ message: "Email verified successfully", success: true });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log(`[AUTH] Login attempt for email: ${email} password: ${password}`); // Debug log

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await UserBaseModel.findOne({ email });

  // Combine checks for security
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isVerified) {
    throw new ApiError(400, "Please verify your email before logging in");
  }

  const authToken = generateJWT(user._id, "7d", "auth", user.tokenVersion);
  res.cookie("authToken", authToken, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    message: "Login successful",
    success: true,
  });
});

export const logout = asyncHandler(async (req, res) => {
  // const { email } = req.params; // Not used but kept in params if needed by routes
  const authToken = req.cookies.authToken;
  if (!authToken) {
    throw new ApiError(400, "No active session found");
  }
  const user = await getUserFromToken(authToken, "auth");
  // Removed strict email check to allow logout after email change

  user.tokenVersion += 1;
  await user.save();
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ message: "Logout successful", success: true });
});

export const getMe = asyncHandler(async (req, res) => {
  const authToken = req.cookies.authToken;
  if (!authToken) {
    throw new ApiError(401, "Not authenticated");
  }
  const user = await getUserFromToken(authToken, "auth");
  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isProfileComplete: user.isProfileComplete,
    },
  });
});

export const setupPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    throw new ApiError(400, "Setup token is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  if (!/\d/.test(password)) {
    throw new ApiError(400, "Password must contain at least one number");
  }

  if (!/[a-zA-Z]/.test(password)) {
    throw new ApiError(400, "Password must contain at least one letter");
  }

  const user = await getUserFromToken(token, "passwordSetup");
  const hashedPassword = await hashPassword(password);

  user.password = hashedPassword;
  user.isVerified = true;
  user.tokenVersion += 1;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password has been set successfully. Please login.",
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await UserBaseModel.findOne({ email });

  // IMPORTANT: Don't reveal if email exists or not (security)
  if (!user) {
    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  }

  const resetToken = generateJWT(
    user._id,
    "30m",
    "passwordReset",
    user.tokenVersion,
  );

  const { sendEmail } = await import("../utils/email-service.js");
  const { resetPasswordEmailTemplate } =
    await import("../utils/email-templates/reset-password-email-template.js");

  const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;
  const emailContent = resetPasswordEmailTemplate({
    name: user.fullName,
    link: resetUrl,
  });

  await sendEmail({
    to: email,
    subject: "Password Reset Request",
    html: emailContent,
  });

  res.status(200).json({
    success: true,
    message:
      "If an account exists with this email, a password reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    throw new ApiError(400, "Reset token is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  if (!/\d/.test(password)) {
    throw new ApiError(400, "Password must contain at least one number");
  }

  if (!/[a-zA-Z]/.test(password)) {
    throw new ApiError(400, "Password must contain at least one letter");
  }

  const user = await getUserFromToken(token, "passwordReset");
  const hashedPassword = await hashPassword(password);

  user.password = hashedPassword;
  user.tokenVersion += 1;
  await user.save();

  res.status(200).json({
    success: true,
    message:
      "Password reset successfully. Please login with your new password.",
  });
});
