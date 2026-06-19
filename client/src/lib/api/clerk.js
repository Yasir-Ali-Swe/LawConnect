// import api from "../axios";
// import { hasProfileImageFile, toProfileFormData } from "./profile-form-data";

// const buildCaseFilterParams = (filters = {}) => {
//     const params = {};
//     if (filters.search) params.search = filters.search;
//     if (filters.status && filters.status !== "all") params.status = filters.status;
//     if (filters.submissionStatus && filters.submissionStatus !== "all") {
//         params.submissionStatus = filters.submissionStatus;
//     }
//     return params;
// };

// export const clerkApi = {
//     // Stats
//     getDashboardStats: async () => {
//         const response = await api.get("/clerk/stats");
//         return response.data;
//     },

//     // Profile
//     getProfile: async () => {
//         const response = await api.get("/clerk/profile");
//         return response.data;
//     },
//     updateProfile: async (data) => {
//         const payload = hasProfileImageFile(data) ? toProfileFormData(data) : data;
//         const response = await api.put("/clerk/profile", payload, hasProfileImageFile(data)
//             ? { headers: { "Content-Type": "multipart/form-data" } }
//             : undefined);
//         return response.data;
//     },

//     // Court Officers
//     getMyCourtOfficers: async () => {
//         const response = await api.get("/clerk/court-officers");
//         return response.data;
//     },

//     // Cases (From Case Routes)
//     getSubmittedCases: async (filtersOrStatus) => {
//         const filters =
//             typeof filtersOrStatus === "string"
//                 ? { submissionStatus: filtersOrStatus }
//                 : filtersOrStatus || {};

//         const response = await api.get(`/case/get-submited-cases`, {
//             params: buildCaseFilterParams(filters),
//         });
//         return response.data;
//     },

//     // Register Case
//     registerCase: async (caseId, data) => {
//         // data should contain { courtOfficerId }
//         const response = await api.post(`/case/register-case/${caseId}`, data);
//         return response.data;
//     },

//     // Case Details
//     getCaseById: async (caseId) => {
//         const response = await api.get(`/case/clerk/case/${caseId}`);
//         return response.data;
//     },
// };

import api from "../axios";
import { hasProfileImageFile, toProfileFormData } from "./profile-form-data";

const buildCaseFilterParams = (filters = {}) => {
  const params = {};
  if (filters.search) params.search = filters.search;
  if (filters.status && filters.status !== "all")
    params.status = filters.status;
  if (filters.submissionStatus && filters.submissionStatus !== "all") {
    params.submissionStatus = filters.submissionStatus;
  }
  return params;
};

export const clerkApi = {
  // Stats
  getDashboardStats: async () => {
    const response = await api.get("/clerk/stats");
    return response.data;
  },

  // Profile
  getProfile: async () => {
    const response = await api.get("/clerk/profile");
    return response.data;
  },
  updateProfile: async (data) => {
    const payload = hasProfileImageFile(data) ? toProfileFormData(data) : data;
    const response = await api.put(
      "/clerk/profile",
      payload,
      hasProfileImageFile(data)
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined,
    );
    return response.data;
  },

  // Court Officers
  getMyCourtOfficers: async (filters) => {
    const response = await api.get("/clerk/court-officers", {
      params: filters,
    });
    return response.data;
  },

  // Cases (From Case Routes)
  getSubmittedCases: async (filtersOrStatus) => {
    const filters =
      typeof filtersOrStatus === "string"
        ? { submissionStatus: filtersOrStatus }
        : filtersOrStatus || {};

    const response = await api.get(`/case/get-submited-cases`, {
      params: buildCaseFilterParams(filters),
    });
    return response.data;
  },

  // Register Case
  registerCase: async (caseId, data) => {
    // data should contain { courtOfficerId }
    const response = await api.post(`/case/register-case/${caseId}`, data);
    return response.data;
  },

  // Case Details
  getCaseById: async (caseId) => {
    const response = await api.get(`/case/clerk/case/${caseId}`);
    return response.data;
  },
};
