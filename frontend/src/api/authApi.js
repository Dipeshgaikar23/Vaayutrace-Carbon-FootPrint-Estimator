import axiosInstance from "./axiosInstance";

export const registerApi = (data) =>
  axiosInstance.post("/auth/register", data);

export const loginApi = (data) => axiosInstance.post("/auth/login", data);

export const logoutApi = () => axiosInstance.post("/auth/logout");

export const getProfileApi = () => axiosInstance.get("/auth/me");

export const checkAuthApi = () => axiosInstance.get("/auth/check");