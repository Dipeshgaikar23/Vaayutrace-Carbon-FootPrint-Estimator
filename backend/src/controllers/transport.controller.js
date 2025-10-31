import axios from "axios";
import { calculateTransport } from "../services/calculator.js";
import { getSuggestion } from "../services/suggestions.js";
import { saveFootprint } from "../dao/footprint.dao.js";
import { getPredictionForDomain } from "../services/ml.service.js";


// Base URL of your Flask ML API
// const ML_API_URL = "http://127.0.0.1:8000/predict";

// Utility to call ML model API
// const getPredictedEmission = async (domain, value) => {
//   try {
//     const response = await axios.post(ML_API_URL, { domain, value });
//     return response.data;
//   } catch (error) {
//     console.error("❌ ML API Error:", error.message);
//     throw new Error("Failed to fetch prediction from ML API");
//   }
// };

// ✅ Public route (no DB save)
export const calculateTransportPublic = async (req, res, next) => {
  try {
    const { energyConsumed } = req.body;
    if (!energyConsumed || energyConsumed <= 0) {
      return res.status(400).json({ message: "Invalid input values" });
    }

    const result = calculateTransport(energyConsumed);
    const suggestion = getSuggestion("transport", result);
    const predictions = await getPredictionForDomain('transport', energyConsumed);


    res.json({
      category: "transport",
      inputData: { energyConsumed },
      result,
      predictions: predictions.predictions,
      comparison: predictions.comparison,
      suggestion
    });
  } catch (error) {
    next(error);
  }
};

// 🔒 Authenticated route (saves to DB)
export const calculateTransportProtected = async (req, res, next) => {
  try {
    const { energyConsumed } = req.body;

    if (!energyConsumed || energyConsumed <= 0 ) {
      return res.status(400).json({ message: "Invalid input values" });
    }

    const result = calculateTransport(energyConsumed);
    const suggestion = getSuggestion("transport", result);
    const predictions = await getPredictionForDomain('transport', energyConsumed);


    const footprint = await saveFootprint({
      category: "transport",
      inputData: { energyConsumed },
      result,
      predictions: predictions.predictions,
      comparison: predictions.comparison,
      suggestion,
      user: req.user._id,   // 👈 save user reference
    });

    res.status(201).json(footprint);
  } catch (error) {
    next(error);
  }
};