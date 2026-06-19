// import api from "@/lib/axios";
// import { hasProfileImageFile, toProfileFormData } from "./profile-form-data";

// export const adminApi = {
//     // Profile
//     getProfile: async () => {
//         const response = await api.get("/admin/get-profile");
//         return response.data;
//     },
//     createProfile: async (data) => {
//         const payload = hasProfileImageFile(data) ? toProfileFormData(data) : data;
//         const response = await api.post("/admin/create-profile", payload, hasProfileImageFile(data)
//             ? { headers: { "Content-Type": "multipart/form-data" } }
//             : undefined);
//         return response.data;
//     },
//     updateProfile: async (data) => {
//         const payload = hasProfileImageFile(data) ? toProfileFormData(data) : data;
//         const response = await api.put("/admin/update-profile", payload, hasProfileImageFile(data)
//             ? { headers: { "Content-Type": "multipart/form-data" } }
//             : undefined);
//         return response.data;
//     },
//     updateAccount: async (data) => {
//         const response = await api.put("/admin/update-account", data);
//         return response.data;
//     },

//     // Users (Internal)
//     getAllInternalUsers: async (role) => {
//         const params = role ? { role } : {};
//         const response = await api.get("/admin/get-internal-users", { params });
//         return response.data;
//     },
//     createInternalUser: async (data) => {
//         const response = await api.post("/admin/create-internal-user", data);
//         return response.data;
//     },
//     getInternalUserById: async (id) => {
//         const response = await api.get(`/admin/get-internal-user/${id}`);
//         return response.data;
//     },

//     // Courts
//     getAllCourts: async () => {
//         const response = await api.get("/admin/get-all-courts");
//         return response.data;
//     },
//     createCourt: async (data) => {
//         const response = await api.post("/admin/create-court", data);
//         return response.data;
//     },
//     getCourtById: async (id) => {
//         const response = await api.get(`/admin/get-court/${id}`);
//         return response.data;
//     },

//     // Assignments
//     assignClerk: async (data) => {
//         // data: { clerkId, courtId }
//         const response = await api.post("/admin/assign-clerk-to-court", data);
//         return response.data;
//     },
//     assignCourtOfficer: async (data) => {
//         // data: { userId, courtId } -- Note param name mismatch in backend controller (userId vs officerId)
//         // admin-controller: const { userId, courtId } = req.body;
//         const response = await api.post("/admin/assigne-court-officer", data);
//         return response.data;
//     },

//     // Helpers
//     getUnassignedClerks: async () => {
//         const response = await api.get("/admin/get-unassigned-clerks");
//         return response.data;
//     },
//     getUnassignedCourtOfficers: async () => {
//         const response = await api.get("/admin/get-unassigned-court-officers");
//         return response.data;
//     },
//     getDashboardStats: async () => {
//         const response = await api.get("/admin/get-dashboard-stats");
//         return response.data;
//     },
// };

import api from "@/lib/axios";
import { hasProfileImageFile, toProfileFormData } from "./profile-form-data";

export const adminApi = {
  // Profile
  getProfile: async () => {
    const response = await api.get("/admin/get-profile");
    return response.data;
  },
  createProfile: async (data) => {
    const payload = hasProfileImageFile(data) ? toProfileFormData(data) : data;
    const response = await api.post(
      "/admin/create-profile",
      payload,
      hasProfileImageFile(data)
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined,
    );
    return response.data;
  },
  updateProfile: async (data) => {
    const payload = hasProfileImageFile(data) ? toProfileFormData(data) : data;
    const response = await api.put(
      "/admin/update-profile",
      payload,
      hasProfileImageFile(data)
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined,
    );
    return response.data;
  },
  updateAccount: async (data) => {
    const response = await api.put("/admin/update-account", data);
    return response.data;
  },

  // Users (Internal)
  getAllInternalUsers: async (filters) => {
    const response = await api.get("/admin/get-internal-users", {
      params: filters,
    });
    return response.data;
  },
  createInternalUser: async (data) => {
    const response = await api.post("/admin/create-internal-user", data);
    return response.data;
  },
  getInternalUserById: async (id) => {
    const response = await api.get(`/admin/get-internal-user/${id}`);
    return response.data;
  },

  // Courts
  getAllCourts: async (filters) => {
    const response = await api.get("/admin/get-all-courts", {
      params: filters,
    });
    return response.data;
  },
  createCourt: async (data) => {
    const response = await api.post("/admin/create-court", data);
    return response.data;
  },
  getCourtById: async (id) => {
    const response = await api.get(`/admin/get-court/${id}`);
    return response.data;
  },

  // Assignments
  assignClerk: async (data) => {
    // data: { clerkId, courtId }
    const response = await api.post("/admin/assign-clerk-to-court", data);
    return response.data;
  },
  assignCourtOfficer: async (data) => {
    // data: { userId, courtId } -- Note param name mismatch in backend controller (userId vs officerId)
    // admin-controller: const { userId, courtId } = req.body;
    const response = await api.post("/admin/assigne-court-officer", data);
    return response.data;
  },

  // Helpers
  getUnassignedClerks: async () => {
    const response = await api.get("/admin/get-unassigned-clerks");
    return response.data;
  },
  getUnassignedCourtOfficers: async () => {
    const response = await api.get("/admin/get-unassigned-court-officers");
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await api.get("/admin/get-dashboard-stats");
    return response.data;
  },
};
