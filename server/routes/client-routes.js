import {
  createClientProfile,
  getClientProfile,
  updateClientProfile,
  updateClientAccount,
  sendProposal,
  getClientProposals,
} from "../controllers/client-controller.js";
import { clientMiddleware } from "../middlewares/client-middleware.js";
import { isProfileComplete } from "../middlewares/profile-complete-middleware.js";
import { uploadProfileImage } from "../middlewares/upload-middleware.js";
import express from "express";

const router = express.Router();

router.post(
  "/create-profile",
  clientMiddleware,
  uploadProfileImage.single("profileImage"),
  createClientProfile,
);
router.get("/get-profile", clientMiddleware, getClientProfile);
router.put(
  "/update-profile",
  clientMiddleware,
  uploadProfileImage.single("profileImage"),
  updateClientProfile,
);
router.put("/update-account", clientMiddleware, updateClientAccount);
router.post(
  "/send-proposal",
  clientMiddleware,
  isProfileComplete,
  sendProposal
);
router.get("/get-proposals-sent", clientMiddleware, getClientProposals);

export default router;
