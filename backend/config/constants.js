export const ELECTRICITY_EMISSION_FACTOR = 0.4; // kg CO2 per kWh

export const TRANSPORT_EMISSION_FACTORS = {
  petrol: 2.31, // kg CO2 per liter
  diesel: 2.68, // kg CO2 per liter
};

export const PREDICTION_MIN_RECORDS = 2;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};