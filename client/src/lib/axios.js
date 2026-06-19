import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Centralized Error Extraction & 401 Handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Set specific message for auth errors
      if (!error.response.data) error.response.data = {};
      if (!error.response.data.message) {
        error.response.data.message = "Session expired. Please login again.";
      }
      // Note: Redux state clearing is handled by components when they catch 401
    } else if (error.response) {
      // For other responses, ensure message exists
      if (!error.response.data) error.response.data = {};
      if (!error.response.data.message) {
        error.response.data.message = "Something went wrong. Please try again.";
      }
    } else {
      // Handle Network/Unknown Errors (No Response)
      error.response = {
        data: {
          message: "Something went wrong. Please try again.",
        },
      };
    }
    return Promise.reject(error);
  },
);

export default api;
