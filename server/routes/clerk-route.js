import express from "express";
import {
    getDashboardStats,
    getMyProfile,
    updateMyProfile,
    getMyCourtOfficers
} from "../controllers/clerk-controller.js";
import { clerkMiddleware } from "../middlewares/clerk-middleware.js";
import { uploadProfileImage } from "../middlewares/upload-middleware.js";


const router = express.Router();

// Apply Clerk Middleware to all routes
router.use(clerkMiddleware);

router.get("/stats", getDashboardStats);
router.get("/profile", getMyProfile);
router.put("/profile", uploadProfileImage.single("profileImage"), updateMyProfile);
router.get("/court-officers", getMyCourtOfficers);

export default router;
