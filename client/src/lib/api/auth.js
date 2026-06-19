import api from "../axios";

export const getMe = () => api.get("/auth/me");
export const login = (data) => api.post("/auth/login", data);
export const logout = () => api.post("/auth/logout");
export const setupPassword = (token, password) =>
    api.post(`/auth/setup-password/${token}`, { password });

export const authApi = {
    getMe,
    login,
    logout,
        setupPassword,
};
