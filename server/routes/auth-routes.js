import express from "express";
import rateLimit from "express-rate-limit";
import {
  registeration,
  verifyEmail,
  login,
  logout,
  getMe,
  setupPassword,
  forgotPassword,
  resetPassword,
} from "../controllers/auth-controller.js";

const router = express.Router();

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Slightly higher for verification
  message: "Too many verification attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, registeration);
router.post("/verify-email/:token", verifyLimiter, verifyEmail);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/setup-password/:token", verifyLimiter, setupPassword);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", verifyLimiter, resetPassword);
router.get("/me", getMe);
export default router;
