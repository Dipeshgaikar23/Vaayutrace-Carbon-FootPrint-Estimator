import * as transportDao from "../dao/transportDao.js";
import {
  calculateTransportCarbon,
  calculateDurationDays,
} from "../utils/carbonUtils.js";
import { predictTransport } from "../utils/predictionUtils.js";
import { PREDICTION_MIN_RECORDS } from "../config/constants.js";

// Calculate only - no DB storage
export const calculateCarbonOnly = (kmDriven, fuelEfficiencyKmpl, fuelType) => {
  const { fuelUsedLiters, carbonEmitted } = calculateTransportCarbon(
    kmDriven,
    fuelEfficiencyKmpl,
    fuelType
  );
  return {
    kmDriven,
    fuelEfficiencyKmpl,
    fuelType,
    fuelUsedLiters,
    carbonEmitted,
    unit: "kg CO₂",
  };
};

// Calculate and save to DB
export const calculateAndSave = async (userId, data) => {
  const { kmDriven, fuelEfficiencyKmpl, fuelType, dateFrom, dateTo } = data;

  const { fuelUsedLiters, carbonEmitted } = calculateTransportCarbon(
    kmDriven,
    fuelEfficiencyKmpl,
    fuelType
  );

  const durationDays = calculateDurationDays(dateFrom, dateTo);
  const dailyAvgCarbon = parseFloat((carbonEmitted / durationDays).toFixed(4));
  const dailyAvgKm = parseFloat((kmDriven / durationDays).toFixed(4));

  const record = await transportDao.createTransportRecord({
    userId,
    kmDriven,
    fuelEfficiencyKmpl,
    fuelType: fuelType.toLowerCase(),
    fuelUsedLiters,
    carbonEmitted,
    dateFrom: new Date(dateFrom),
    dateTo: new Date(dateTo),
    durationDays,
    dailyAvgCarbon,
    dailyAvgKm,
  });

  return {
    record,
    fuelUsedLiters,
    carbonEmitted,
    unit: "kg CO₂",
  };
};

// Get user records
export const getUserRecords = async (userId) => {
  const records = await transportDao.getUserTransportRecords(userId);
  const count = await transportDao.getUserTransportRecordCount(userId);
  return { records, count, canPredict: count >= PREDICTION_MIN_RECORDS };
};

// Delete record
export const deleteRecord = async (recordId, userId) => {
  const record = await transportDao.deleteTransportRecord(recordId, userId);
  if (!record) {
    throw new Error("Record not found or unauthorized");
  }
  return record;
};

// Get predictions (next month by default = 30 days)
export const getPredictions = async (userId, predictionDays = 30) => {
  const records = await transportDao.getUserTransportRecords(userId);

  if (records.length < PREDICTION_MIN_RECORDS) {
    return {
      canPredict: false,
      reason: `Need at least ${PREDICTION_MIN_RECORDS} records. You have ${records.length}.`,
      recordCount: records.length,
    };
  }

  const result = predictTransport(records, predictionDays);
  return { ...result, recordCount: records.length };
};