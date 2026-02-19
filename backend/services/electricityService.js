import * as electricityDao from "../dao/electricityDao.js";
import {
  calculateElectricityCarbon,
  calculateDurationDays,
} from "../utils/carbonUtils.js";
import { predictElectricity } from "../utils/predictionUtils.js";
import { PREDICTION_MIN_RECORDS } from "../config/constants.js";

// Calculate only - no DB storage
export const calculateCarbonOnly = (electricityUsed) => {
  const carbonEmitted = calculateElectricityCarbon(electricityUsed);
  return {
    electricityUsed,
    carbonEmitted,
    emissionFactor: 0.4,
    unit: "kg CO₂",
  };
};

// Calculate and save to DB
export const calculateAndSave = async (userId, data) => {
  const { electricityUsed, dateFrom, dateTo } = data;

  const carbonEmitted = calculateElectricityCarbon(electricityUsed);
  const durationDays = calculateDurationDays(dateFrom, dateTo);
  const dailyAvgCarbon = parseFloat((carbonEmitted / durationDays).toFixed(4));
  const dailyAvgElectricity = parseFloat(
    (electricityUsed / durationDays).toFixed(4)
  );

  const record = await electricityDao.createElectricityRecord({
    userId,
    electricityUsed,
    carbonEmitted,
    dateFrom: new Date(dateFrom),
    dateTo: new Date(dateTo),
    durationDays,
    dailyAvgCarbon,
    dailyAvgElectricity,
  });

  return {
    record,
    carbonEmitted,
    emissionFactor: 0.4,
    unit: "kg CO₂",
  };
};

// Get user records
export const getUserRecords = async (userId) => {
  const records = await electricityDao.getUserElectricityRecords(userId);
  const count = await electricityDao.getUserElectricityRecordCount(userId);
  return { records, count, canPredict: count >= PREDICTION_MIN_RECORDS };
};

// Delete record
export const deleteRecord = async (recordId, userId) => {
  const record = await electricityDao.deleteElectricityRecord(recordId, userId);
  if (!record) {
    throw new Error("Record not found or unauthorized");
  }
  return record;
};

// Get predictions
export const getPredictions = async (userId, predictionDays) => {
  const records = await electricityDao.getUserElectricityRecords(userId);

  if (records.length < PREDICTION_MIN_RECORDS) {
    return {
      canPredict: false,
      reason: `Need at least ${PREDICTION_MIN_RECORDS} records. You have ${records.length}.`,
      recordCount: records.length,
    };
  }

  const result = predictElectricity(records, predictionDays);
  return { ...result, recordCount: records.length };
};