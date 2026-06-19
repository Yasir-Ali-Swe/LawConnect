import notificationModel from "../models/notification-model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const notifications = await notificationModel.find({ userId })
            .sort({ createdAt: -1 })
            .populate("caseId", "caseNumber title"); // Optional: populate basic case info

        return res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        const { notificationId } = req.params;

        const notification = await notificationModel.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        if (notification.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        notification.isRead = true;
        await notification.save();

        return res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        await notificationModel.updateMany({ userId, isRead: false }, { isRead: true });
        return res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.userId;
        const count = await notificationModel.countDocuments({ userId, isRead: false });
        // Return as simple valid JSON
        return res.status(200).json({ success: true, count });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
