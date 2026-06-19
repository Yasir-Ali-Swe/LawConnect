import { api } from "@/lib/api";

export const notificationsApi = {
    getAll: async () => {
        const response = await api.get("/notifications");
        return response.data;
    },
    markAsRead: async (id) => {
        await api.patch(`/notifications/${id}/read`);
    },
    markAllRead: async () => {
        await api.patch("/notifications/read-all");
    },
    getUnreadCount: async () => {
        const response = await api.get("/notifications/unread-count");
        return response.data;
    }
};
