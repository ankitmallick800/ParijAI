import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 180000,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    let message = error.message || "Request failed";
    if (!error.response) {
      message = "Cannot reach the planner. Start the API with pnpm run dev:api and try again.";
    }
    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      message = data.detail.map((item: { msg?: string }) => item.msg || "Invalid request").join(" ");
    } else if (typeof data?.message === "string") {
      message = data.message;
    }
    return Promise.reject(new Error(message));
  }
);
