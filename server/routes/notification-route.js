import express from "express";
import * as notificationController from "../controllers/notification-controller.js";
import { verifyToken } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.get("/", verifyToken, notificationController.getNotifications);
router.get("/unread-count", verifyToken, notificationController.getUnreadCount);
router.patch("/read-all", verifyToken, notificationController.markAllAsRead);
router.patch("/:notificationId/read", verifyToken, notificationController.markAsRead);

export default router;
