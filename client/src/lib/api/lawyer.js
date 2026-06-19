import api from "@/lib/axios";
import { hasProfileImageFile, toProfileFormData } from "./profile-form-data";

export const lawyerApi = {
    getStats: async () => {
        const response = await api.get("/lawyer/dashboard-stats");
        return response.data;
    },
    getInfo: async () => {
        const response = await api.get("/lawyer/get-info");
        return response.data;
    },
    completeProfile: async (data) => {
        const payload = hasProfileImageFile(data) ? toProfileFormData(data) : data;
        const response = await api.post("/lawyer/complete-profile", payload, hasProfileImageFile(data)
            ? { headers: { "Content-Type": "multipart/form-data" } }
            : undefined);
        return response.data;
    },
    getProposals: async (status) => {
        const params = status ? { status } : {};
        const response = await api.get("/lawyer/get-proposals-received", { params });
        return response.data;
    },
    updateProposalStatus: async (proposalId, status) => {
        const response = await api.put("/lawyer/update-proposal-status", { proposalId, status });
        return response.data;
    },
    updateAccount: async (data) => {
        const response = await api.put("/lawyer/update-account", data);
        return response.data;
    },
    updateInfo: async (data) => {
        const payload = hasProfileImageFile(data) ? toProfileFormData(data) : data;
        const response = await api.put("/lawyer/update-info", payload, hasProfileImageFile(data)
            ? { headers: { "Content-Type": "multipart/form-data" } }
            : undefined);
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get("/lawyer/get-lawyer-profile");
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await api.put("/lawyer/update-lawyer-profile", data);
        return response.data;
    },
    getPublicLawyers: async () => {
        const response = await api.get("/lawyer/public/all");
        return response.data;
    }
};
