import {
  createMessage,
  getMessagesByConversation,
  getConversations,
  initiateConversation,
  markMessagesSeen,
} from "../controllers/message-controller.js";
import { lawyerClientMiddleware } from "../middlewares/lawyer-client-middleware.js";
import express from "express";

const router = express.Router();

router.post("/create-message", lawyerClientMiddleware, createMessage);
router.get(
  "/get-messages-history/:conversationId",
  lawyerClientMiddleware,
  getMessagesByConversation,
);
router.get("/get-conversations", lawyerClientMiddleware, getConversations);
router.post("/initiate", lawyerClientMiddleware, initiateConversation);
router.put("/mark-seen/:conversationId", lawyerClientMiddleware, markMessagesSeen);

export default router;
