import { EMISSION_FACTORS } from "../utils/constants.js";

export const calculateElectricity = (energyConsumed) => {
  return energyConsumed * EMISSION_FACTORS.ELECTRICITY;
};

export const calculateTransport = (milesDriven) => {
  return milesDriven * EMISSION_FACTORS.TRANSPORT;
};

export const calculateManufacturing = (productsProduced) => {
  return productsProduced * EMISSION_FACTORS.MANUFACTURING;
};

export const calculateConstruction = (materialsUsed) => {
  return materialsUsed * EMISSION_FACTORS.CONSTRUCTION;
};

export const calculateAgriculture = (cropsGrown) => {
  return cropsGrown * EMISSION_FACTORS.AGRICULTURE;
};
