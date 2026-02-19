import {
  ELECTRICITY_EMISSION_FACTOR,
  TRANSPORT_EMISSION_FACTORS,
} from "../config/constants.js";

// Electricity carbon calculation
export const calculateElectricityCarbon = (electricityUsedKwh) => {
  return parseFloat(
    (electricityUsedKwh * ELECTRICITY_EMISSION_FACTOR).toFixed(4)
  );
};

// Transport carbon calculation
export const calculateTransportCarbon = (kmDriven, fuelEfficiencyKmpl, fuelType) => {
  const factor =
    TRANSPORT_EMISSION_FACTORS[fuelType.toLowerCase()] ||
    TRANSPORT_EMISSION_FACTORS.petrol;
  const fuelUsedLiters = parseFloat((kmDriven / fuelEfficiencyKmpl).toFixed(4));
  const carbonEmitted = parseFloat((fuelUsedLiters * factor).toFixed(4));
  return { fuelUsedLiters, carbonEmitted };
};

// Calculate duration in days between two dates
export const calculateDurationDays = (dateFrom, dateTo) => {
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1;
};