import axiosInstance from "./axiosInstance";

export const calculateElectricityApi = (data) =>
  axiosInstance.post("/electricity/calculate", data);

export const calculateAndSaveElectricityApi = (data) =>
  axiosInstance.post("/electricity/calculate-save", data);

export const getElectricityRecordsApi = () =>
  axiosInstance.get("/electricity/records");

export const deleteElectricityRecordApi = (id) =>
  axiosInstance.delete(`/electricity/records/${id}`);

export const getElectricityPredictionApi = (days) =>
  axiosInstance.get(`/electricity/predict?days=${days}`);