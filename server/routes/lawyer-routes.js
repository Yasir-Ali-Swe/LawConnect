import {
  createLawyerInfo,
  getLawyerInfo,
  updateLawyerInfo,
  createLawyerProfile,
  getLawyerProfile,
  updateLawyerProfile,
  updateProposalStatus,
  getLawyerProposals,
  completeProfile,
  updateLawyerAccount,
  getPublicLawyers,
} from "../controllers/lawyer-controller.js";
import express from "express";
import { lawyerMiddleware } from "../middlewares/lawyer-middleware.js";
import { getLawyerStats } from "../controllers/dashboard-controller.js";
import { uploadProfileImage } from "../middlewares/upload-middleware.js";

const router = express.Router();

router.get("/public/all", getPublicLawyers);
router.post(
  "/create-info",
  lawyerMiddleware,
  uploadProfileImage.single("profileImage"),
  createLawyerInfo,
);
router.get("/get-info", lawyerMiddleware, getLawyerInfo);
router.put(
  "/update-info",
  lawyerMiddleware,
  uploadProfileImage.single("profileImage"),
  updateLawyerInfo,
);
router.post("/create-lawyer-profile", lawyerMiddleware, createLawyerProfile);
router.get("/get-lawyer-profile", lawyerMiddleware, getLawyerProfile);
router.put("/update-lawyer-profile", lawyerMiddleware, updateLawyerProfile);
router.put(
  "/update-proposal-status",
  lawyerMiddleware,
  updateProposalStatus
);

router.get("/dashboard-stats", lawyerMiddleware, getLawyerStats);
router.post(
  "/complete-profile",
  lawyerMiddleware,
  uploadProfileImage.single("profileImage"),
  completeProfile,
);
router.get("/get-proposals-received", lawyerMiddleware, getLawyerProposals);
router.put("/update-account", lawyerMiddleware, updateLawyerAccount);

export default router;
