import api from "../axios";
import { hasProfileImageFile, toProfileFormData } from "./profile-form-data";

export const courtOfficerApi = {
    // Stats
    getDashboardStats: async () => {
        const response = await api.get("/court-officer/stats");
        return response.data;
    },

    // Cases
    getAllCases: async () => {
        const response = await api.get("/court-officer/get-all-case");
        return response.data;
    },
    getCaseById: async (caseId) => {
        const response = await api.get(`/court-officer/get-active-case/${caseId}`);
        return response.data;
    },
    updateCaseStatus: async (caseId, data) => {
        const response = await api.put(`/court-officer/update-case-status/${caseId}`, data);
        return response.data;
    },

    // Hearings
    getHearings: async (caseId) => {
        const response = await api.get(`/court-officer/get-hearings/${caseId}`);
        return response.data;
    },
    scheduleHearing: async (caseId, data) => {
        const response = await api.post(`/court-officer/schedule-hearing/${caseId}`, data);
        return response.data;
    },
    updateHearingStatus: async (hearingId, data) => {
        const response = await api.put(`/court-officer/update-hearing-status/${hearingId}`, data);
        return response.data;
    },

    // Judgment
    makeJudgment: async (caseId, data) => {
        const response = await api.post(`/court-officer/make-judgment/${caseId}`, data);
        return response.data;
    },

    // Profile
    getProfile: async () => {
        const response = await api.get("/court-officer/profile");
        return response.data;
    },
    updateProfile: async (data) => {
        const payload = hasProfileImageFile(data) ? toProfileFormData(data) : data;
        const response = await api.put("/court-officer/profile", payload, hasProfileImageFile(data)
            ? { headers: { "Content-Type": "multipart/form-data" } }
            : undefined);
        return response.data;
    }
};
