import axiosInstance from "./axiosInstance";

export const getDashboardStatsApi = () => axiosInstance.get("/dashboard/stats");

export const getQuickStatsApi = () => axiosInstance.get("/dashboard/quick");