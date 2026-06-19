import api from "./axios";

export const authApi = {
    register: async (userData) => {
        const response = await api.post("/auth/register", userData);
        return response.data;
    },

    verifyEmail: async (token) => {
        const response = await api.post(`/auth/verify-email/${token}`);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post("/auth/login", credentials);
        return response.data;
    },

    logout: async () => {
        const response = await api.post(`/auth/logout`);
        return response.data;
    },

    setupPassword: async (token, password) => {
        const response = await api.post(`/auth/setup-password/${token}`, { password });
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post("/auth/forgot-password", { email });
        return response.data;
    },

    resetPassword: async (token, password) => {
        const response = await api.post(`/auth/reset-password/${token}`, { password });
        return response.data;
    },

    getMe: async () => {
        const response = await api.get("/auth/me");
        return response.data;
    },
};

export { api };
