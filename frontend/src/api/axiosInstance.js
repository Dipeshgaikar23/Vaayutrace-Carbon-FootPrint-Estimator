import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "import.meta.process.env.VITE_API_URL",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || "Something went wrong";
    return Promise.reject({ ...error, message });
  }
);

export default axiosInstance;
