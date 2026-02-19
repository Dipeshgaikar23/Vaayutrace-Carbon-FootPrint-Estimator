import axiosInstance from "./axiosInstance";

export const calculateTransportApi = (data) =>
  axiosInstance.post("/transport/calculate", data);

export const calculateAndSaveTransportApi = (data) =>
  axiosInstance.post("/transport/calculate-save", data);

export const getTransportRecordsApi = () =>
  axiosInstance.get("/transport/records");

export const deleteTransportRecordApi = (id) =>
  axiosInstance.delete(`/transport/records/${id}`);

export const getTransportPredictionApi = (days) =>
  axiosInstance.get(`/transport/predict?days=${days}`);