import api from "@/lib/axios";

const buildCaseFilterParams = (filters = {}) => {
    const params = {};

    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== "all") params.status = filters.status;
    if (filters.submissionStatus && filters.submissionStatus !== "all") {
        params.submissionStatus = filters.submissionStatus;
    }

    return params;
};

export const casesApi = {
    getAll: async (filters = {}) => {
        const response = await api.get("/case/get-all-case", {
            params: buildCaseFilterParams(filters),
        });
        return response.data;
    },
    getById: async (caseId) => {
        const response = await api.get(`/case/get-case/${caseId}`);
        return response.data;
    },
    getHearings: async (caseId) => {
        const response = await api.get(`/case/${caseId}/hearings`);
        return response.data;
    },
    getDocuments: async (caseId) => {
        const response = await api.get(`/case/${caseId}/documents`);
        return response.data;
    },
    getJudgments: async (caseId) => {
        const response = await api.get(`/case/${caseId}/judgments`);
        return response.data;
    },
    // New methods for Lawyer Case Flow
    createDraft: async (data) => {
        const response = await api.post("/case/draft-case", data);
        return response.data;
    },
    updateDraft: async (caseId, data) => {
        const response = await api.put(`/case/update-draft-case/${caseId}`, data);
        return response.data;
    },
    submitCase: async (caseId, courtId) => {
        const response = await api.post(`/case/submit-case/${caseId}`, { courtId });
        return response.data;
    },
    getCourts: async () => {
        const response = await api.get("/case/get-courts");
        return response.data;
    },
    getAcceptedClients: async () => {
        const response = await api.get("/case/accepted-clients");
        return response.data;
    },
    getClientById: async (caseId) => {
        const response = await api.get(`/case/client/cases/${caseId}`);
        return response.data;
    },
    getClientCases: async (filters = {}) => {
        const response = await api.get("/case/client/cases", {
            params: buildCaseFilterParams(filters),
        });
        return response.data;
    },
    getClientHearings: async (caseId) => {
        const response = await api.get(`/case/client/cases/${caseId}/hearings`);
        return response.data;
    },
    getClientJudgments: async (caseId) => {
        const response = await api.get(`/case/client/cases/${caseId}/judgments`);
        return response.data;
    },
    // Client documents
    getClientDocuments: async (caseId) => {
        const response = await api.get(`/case/client/cases/${caseId}/documents`);
        return response.data;
    },
    uploadDocument: async (caseId, formData) => {
        const response = await api.post(`/case/client/cases/${caseId}/upload-document`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    // Court officer documents
    getOfficerDocuments: async (caseId) => {
        const response = await api.get(`/case/officer/${caseId}/documents`);
        return response.data;
    },
};

