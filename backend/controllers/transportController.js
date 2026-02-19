import * as transportService from "../services/transportService.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

// POST /api/transport/calculate (no auth required)
export const calculateOnly = async (req, res) => {
  try {
    const { kmDriven, fuelEfficiencyKmpl, fuelType } = req.body;

    if (!kmDriven || kmDriven <= 0)
      return errorResponse(res, 400, "Valid KM driven is required");
    if (!fuelEfficiencyKmpl || fuelEfficiencyKmpl <= 0)
      return errorResponse(res, 400, "Valid fuel efficiency (kmpl) is required");
    if (!fuelType || !["petrol", "diesel"].includes(fuelType.toLowerCase()))
      return errorResponse(res, 400, "Fuel type must be petrol or diesel");

    const result = transportService.calculateCarbonOnly(
      parseFloat(kmDriven),
      parseFloat(fuelEfficiencyKmpl),
      fuelType
    );

    return successResponse(
      res,
      200,
      "Transport carbon emission calculated",
      result
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// POST /api/transport/calculate-save (auth required)
export const calculateAndSave = async (req, res) => {
  try {
    const { kmDriven, fuelEfficiencyKmpl, fuelType, dateFrom, dateTo } =
      req.body;

    if (!kmDriven || kmDriven <= 0)
      return errorResponse(res, 400, "Valid KM driven is required");
    if (!fuelEfficiencyKmpl || fuelEfficiencyKmpl <= 0)
      return errorResponse(res, 400, "Valid fuel efficiency (kmpl) is required");
    if (!fuelType || !["petrol", "diesel"].includes(fuelType.toLowerCase()))
      return errorResponse(res, 400, "Fuel type must be petrol or diesel");
    if (!dateFrom || !dateTo)
      return errorResponse(res, 400, "Date range is required");
    if (new Date(dateFrom) > new Date(dateTo))
      return errorResponse(res, 400, "Start date must be before end date");

    const result = await transportService.calculateAndSave(req.user._id, {
      kmDriven: parseFloat(kmDriven),
      fuelEfficiencyKmpl: parseFloat(fuelEfficiencyKmpl),
      fuelType,
      dateFrom,
      dateTo,
    });

    return successResponse(
      res,
      201,
      "Transport carbon emission calculated and saved",
      result
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// GET /api/transport/records (auth required)
export const getRecords = async (req, res) => {
  try {
    const result = await transportService.getUserRecords(req.user._id);
    return successResponse(res, 200, "Records fetched", result);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// DELETE /api/transport/records/:id (auth required)
export const deleteRecord = async (req, res) => {
  try {
    await transportService.deleteRecord(req.params.id, req.user._id);
    return successResponse(res, 200, "Record deleted successfully");
  } catch (error) {
    return errorResponse(
      res,
      error.message.includes("not found") ? 404 : 500,
      error.message
    );
  }
};

// GET /api/transport/predict?days=30 (auth required)
export const getPrediction = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    if (days < 1 || days > 365)
      return errorResponse(res, 400, "Prediction days must be between 1 and 365");

    const result = await transportService.getPredictions(req.user._id, days);
    return successResponse(res, 200, "Prediction generated", result);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};