import { calculateAgriculture } from "../services/calculator.js";
import { getSuggestion } from "../services/suggestions.js";
import { saveFootprint } from "../dao/footprint.dao.js";
import { getPredictionForDomain } from "../services/ml.service.js";

// ✅ Public route (no DB save)
export const calculateAgriculturePublic = async (req, res, next) => {
  try {
    const { energyConsumed } = req.body;
    if (!energyConsumed || energyConsumed <= 0) {
      return res.status(400).json({ message: "Invalid energy input" });
    }

    const result = calculateAgriculture(energyConsumed);
    const suggestion = getSuggestion("agriculture", result);
    const predictions = await getPredictionForDomain('agriculture', energyConsumed);


    res.json({
      category: "agriculture",
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
export const calculateAgricultureProtected = async (req, res, next) => {
  try {
    const { energyConsumed } = req.body;
    if (!energyConsumed || energyConsumed <= 0) {
      return res.status(400).json({ message: "Invalid energy input" });
    }

    const result = calculateAgriculture(energyConsumed);
    const suggestion = getSuggestion("agriculture", result);
    const predictions = await getPredictionForDomain('agriculture', energyConsumed);


    const footprint = await saveFootprint({
      category: "agriculture",
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



