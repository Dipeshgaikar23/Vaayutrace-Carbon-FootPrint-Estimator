import * as electricityService from "../services/electricityService.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

// POST /api/electricity/calculate (no auth required)
export const calculateOnly = async (req, res) => {
  try {
    const { electricityUsed } = req.body;

    if (!electricityUsed || electricityUsed <= 0) {
      return errorResponse(res, 400, "Valid electricity usage (kWh) is required");
    }

    const result = electricityService.calculateCarbonOnly(
      parseFloat(electricityUsed)
    );
    return successResponse(
      res,
      200,
      "Carbon emission calculated successfully",
      result
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// POST /api/electricity/calculate-save (auth required)
export const calculateAndSave = async (req, res) => {
  try {
    const { electricityUsed, dateFrom, dateTo } = req.body;

    if (!electricityUsed || electricityUsed <= 0) {
      return errorResponse(res, 400, "Valid electricity usage (kWh) is required");
    }
    if (!dateFrom || !dateTo) {
      return errorResponse(res, 400, "Date range is required");
    }
    if (new Date(dateFrom) > new Date(dateTo)) {
      return errorResponse(res, 400, "Start date must be before end date");
    }

    const result = await electricityService.calculateAndSave(req.user._id, {
      electricityUsed: parseFloat(electricityUsed),
      dateFrom,
      dateTo,
    });

    return successResponse(
      res,
      201,
      "Carbon emission calculated and saved",
      result
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// GET /api/electricity/records (auth required)
export const getRecords = async (req, res) => {
  try {
    const result = await electricityService.getUserRecords(req.user._id);
    return successResponse(res, 200, "Records fetched", result);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// DELETE /api/electricity/records/:id (auth required)
export const deleteRecord = async (req, res) => {
  try {
    await electricityService.deleteRecord(req.params.id, req.user._id);
    return successResponse(res, 200, "Record deleted successfully");
  } catch (error) {
    return errorResponse(
      res,
      error.message.includes("not found") ? 404 : 500,
      error.message
    );
  }
};

// GET /api/electricity/predict?days=10 (auth required)
export const getPrediction = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 10;

    if (days < 1 || days > 365) {
      return errorResponse(res, 400, "Prediction days must be between 1 and 365");
    }

    const result = await electricityService.getPredictions(req.user._id, days);
    return successResponse(res, 200, "Prediction generated", result);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};