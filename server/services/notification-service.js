import notificationModel from "../models/notification-model.js";
import caseModel from "../models/case-model.js";

export const createNotification = async ({ userId, role, caseId, type, title, message, metadata }) => {
    try {
        if (!userId || !caseId || !title || !message) {
            console.error("Missing required fields for notification creation");
            return;
        }

        await notificationModel.create({
            userId,
            role,
            caseId,
            type,
            title,
            message,
            metadata
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

/**
 * Notify all relevant parties of a case (Client and Lawyer) except the triggerer
 * @param {string} caseId 
 * @param {string} triggererUserId - The ID of the user who triggered the event (to avoid self-notification if applicable)
 * @param {object} notificationData - { type, title, message, metadata }
 */
export const notifyCaseParties = async (caseId, triggererUserId, notificationData) => {
    try {
        const caseData = await caseModel.findById(caseId);
        if (!caseData) return;

        const { clientId, lawyerId } = caseData;

        // Notify Client
        if (clientId && clientId.toString() !== triggererUserId) {
            await createNotification({
                userId: clientId,
                role: "client",
                caseId,
                ...notificationData
            });
        }

        // Notify Lawyer
        if (lawyerId && lawyerId.toString() !== triggererUserId) {
            await createNotification({
                userId: lawyerId,
                role: "lawyer",
                caseId,
                ...notificationData
            });
        }
    } catch (error) {
        console.error("Error notifying case parties:", error);
    }
};
