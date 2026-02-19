/**
 * VaayuTrace - Advanced Prediction Engine
 * Uses ensemble of multiple models for better accuracy
 */

// ============================================
// STATISTICAL HELPERS
// ============================================

const mean = (arr) => {
  if (!arr || arr.length === 0) return 0;
  const validArr = arr.filter((v) => typeof v === "number" && !isNaN(v));
  if (validArr.length === 0) return 0;
  return validArr.reduce((a, b) => a + b, 0) / validArr.length;
};

const standardDeviation = (arr) => {
  if (!arr || arr.length < 2) return 0;
  const validArr = arr.filter((v) => typeof v === "number" && !isNaN(v));
  if (validArr.length < 2) return 0;
  const avg = mean(validArr);
  const squareDiffs = validArr.map((value) => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
};

const normalize = (arr) => {
  const validArr = arr.filter((v) => typeof v === "number" && !isNaN(v));
  if (validArr.length === 0) return arr.map(() => 0.5);
  const min = Math.min(...validArr);
  const max = Math.max(...validArr);
  if (max === min) return arr.map(() => 0.5);
  return arr.map((v) => (typeof v === "number" && !isNaN(v) ? (v - min) / (max - min) : 0.5));
};

const denormalize = (normalizedValue, min, max) => {
  return normalizedValue * (max - min) + min;
};

// ============================================
// DATE HELPERS
// ============================================

const isValidDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

const safeGetMonth = (dateValue) => {
  try {
    if (!dateValue) return null;
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 7);
  } catch (e) {
    return null;
  }
};

const safeFormatDate = (dateValue) => {
  try {
    if (!dateValue) return null;
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch (e) {
    return null;
  }
};

const safeDateDiff = (date1, date2) => {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    return (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
  } catch (e) {
    return 0;
  }
};

// ============================================
// MODEL 1: LINEAR REGRESSION
// ============================================

const linearRegression = (xValues, yValues) => {
  const n = xValues.length;
  if (n < 2) return null;

  // Filter out invalid values
  const validPairs = [];
  for (let i = 0; i < n; i++) {
    if (
      typeof xValues[i] === "number" &&
      !isNaN(xValues[i]) &&
      typeof yValues[i] === "number" &&
      !isNaN(yValues[i])
    ) {
      validPairs.push({ x: xValues[i], y: yValues[i] });
    }
  }

  if (validPairs.length < 2) return null;

  const validX = validPairs.map((p) => p.x);
  const validY = validPairs.map((p) => p.y);
  const validN = validX.length;

  const sumX = validX.reduce((a, b) => a + b, 0);
  const sumY = validY.reduce((a, b) => a + b, 0);
  const sumXY = validX.reduce((acc, x, i) => acc + x * validY[i], 0);
  const sumXX = validX.reduce((acc, x) => acc + x * x, 0);

  const denominator = validN * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (validN * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / validN;

  // Calculate R-squared
  const yMean = sumY / validN;
  const ssTot = validY.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
  const ssRes = validX.reduce(
    (acc, x, i) => acc + Math.pow(validY[i] - (slope * x + intercept), 2),
    0
  );
  const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return { slope, intercept, rSquared, predict: (x) => slope * x + intercept };
};

// ============================================
// MODEL 2: POLYNOMIAL REGRESSION (Degree 2)
// ============================================

const polynomialRegression = (xValues, yValues, degree = 2) => {
  const n = xValues.length;
  if (n < degree + 1) return null;

  try {
    // Build Vandermonde matrix
    const matrix = [];
    const vector = [];

    for (let i = 0; i <= degree; i++) {
      matrix[i] = [];
      for (let j = 0; j <= degree; j++) {
        matrix[i][j] = xValues.reduce((sum, x) => sum + Math.pow(x, i + j), 0);
      }
      vector[i] = xValues.reduce((sum, x, idx) => sum + Math.pow(x, i) * yValues[idx], 0);
    }

    // Solve using Gaussian elimination
    const coefficients = gaussianElimination(matrix, vector);
    if (!coefficients) return null;

    // Calculate R-squared
    const yMean = mean(yValues);
    const ssTot = yValues.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
    const predictions = xValues.map((x) =>
      coefficients.reduce((sum, c, i) => sum + c * Math.pow(x, i), 0)
    );
    const ssRes = yValues.reduce(
      (acc, y, i) => acc + Math.pow(y - predictions[i], 2),
      0
    );
    const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

    return {
      coefficients,
      rSquared,
      predict: (x) => coefficients.reduce((sum, c, i) => sum + c * Math.pow(x, i), 0),
    };
  } catch (e) {
    return null;
  }
};

const gaussianElimination = (matrix, vector) => {
  try {
    const n = matrix.length;
    const augmented = matrix.map((row, i) => [...row, vector[i]]);

    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      if (Math.abs(augmented[i][i]) < 1e-10) return null;

      // Eliminate column
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    // Back substitution
    const solution = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      solution[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        solution[i] -= augmented[i][j] * solution[j];
      }
      solution[i] /= augmented[i][i];
    }

    return solution;
  } catch (e) {
    return null;
  }
};

// ============================================
// MODEL 3: WEIGHTED MOVING AVERAGE
// ============================================

const weightedMovingAverage = (values, weights = null) => {
  const validValues = values.filter((v) => typeof v === "number" && !isNaN(v));
  const n = validValues.length;
  if (n === 0) return 0;

  if (!weights) {
    // Generate exponential weights (more recent = higher weight)
    weights = validValues.map((_, i) => Math.pow(1.5, i));
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return mean(validValues);

  const weightedSum = validValues.reduce((sum, val, i) => sum + val * weights[i], 0);

  return weightedSum / totalWeight;
};

// ============================================
// MODEL 4: EXPONENTIAL SMOOTHING (Holt's Method)
// ============================================

const holtExponentialSmoothing = (values, alpha = 0.3, beta = 0.1) => {
  const validValues = values.filter((v) => typeof v === "number" && !isNaN(v));
  const n = validValues.length;
  if (n === 0) return { level: 0, trend: 0, predict: () => 0 };
  if (n < 2) return { level: validValues[0], trend: 0, predict: (steps) => validValues[0] };

  let level = validValues[0];
  let trend = validValues[1] - validValues[0];

  for (let i = 1; i < n; i++) {
    const prevLevel = level;
    level = alpha * validValues[i] + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  return {
    level,
    trend,
    predict: (steps) => level + steps * trend,
  };
};

// ============================================
// MODEL 5: SEASONAL DECOMPOSITION
// ============================================

const detectSeasonality = (values, maxPeriod = 7) => {
  const validValues = values.filter((v) => typeof v === "number" && !isNaN(v));
  const n = validValues.length;
  if (n < maxPeriod * 2) return null;

  let bestPeriod = 0;
  let bestCorrelation = 0;

  for (let period = 2; period <= Math.min(maxPeriod, Math.floor(n / 2)); period++) {
    let correlation = 0;
    let count = 0;

    for (let i = period; i < n; i++) {
      correlation += validValues[i] * validValues[i - period];
      count++;
    }

    if (count > 0) {
      correlation /= count;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }
  }

  const avgValue = mean(validValues);
  return bestCorrelation > avgValue * 0.5 ? bestPeriod : null;
};

// ============================================
// ENSEMBLE PREDICTION ENGINE
// ============================================

const ensemblePredict = (records, predictionDays, valueKey, avgKey) => {
  if (!records || !Array.isArray(records) || records.length < 2) {
    return {
      canPredict: false,
      reason: "Need at least 2 records for prediction",
    };
  }

  // Filter records with valid dates and values
  const validRecords = records.filter((r) => {
    return (
      r &&
      isValidDate(r.dateFrom) &&
      typeof r[avgKey] === "number" &&
      !isNaN(r[avgKey])
    );
  });

  if (validRecords.length < 2) {
    return {
      canPredict: false,
      reason: "Need at least 2 valid records with dates for prediction",
    };
  }

  // Sort by date
  validRecords.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));

  // Prepare data
  const baseDate = new Date(validRecords[0].dateFrom).getTime();
  const xValues = validRecords.map((r) => {
    return safeDateDiff(r.dateFrom, validRecords[0].dateFrom);
  });
  const yValues = validRecords.map((r) => r[avgKey]);

  // Remove outliers using IQR method
  const sortedY = [...yValues].sort((a, b) => a - b);
  const q1Index = Math.floor(sortedY.length * 0.25);
  const q3Index = Math.floor(sortedY.length * 0.75);
  const q1 = sortedY[q1Index] || 0;
  const q3 = sortedY[q3Index] || sortedY[sortedY.length - 1] || 0;
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const cleanedIndices = yValues
    .map((y, i) => (y >= lowerBound && y <= upperBound ? i : -1))
    .filter((i) => i !== -1);

  // If too many outliers, use all data
  const cleanX =
    cleanedIndices.length >= 2
      ? cleanedIndices.map((i) => xValues[i])
      : xValues;
  const cleanY =
    cleanedIndices.length >= 2
      ? cleanedIndices.map((i) => yValues[i])
      : yValues;

  if (cleanX.length < 2) {
    return {
      canPredict: false,
      reason: "Not enough valid data points after filtering",
    };
  }

  // Train multiple models
  const models = [];
  const modelWeights = [];

  // 1. Linear Regression
  const linearModel = linearRegression(cleanX, cleanY);
  if (linearModel && linearModel.rSquared > 0) {
    models.push({ name: "Linear", model: linearModel, weight: linearModel.rSquared });
    modelWeights.push(linearModel.rSquared);
  }

  // 2. Polynomial Regression (if enough data)
  if (cleanX.length >= 4) {
    const polyModel = polynomialRegression(cleanX, cleanY, 2);
    if (polyModel && polyModel.rSquared > 0) {
      models.push({
        name: "Polynomial",
        model: polyModel,
        weight: polyModel.rSquared * 1.1,
      });
      modelWeights.push(polyModel.rSquared * 1.1);
    }
  }

  // 3. Holt's Exponential Smoothing
  const holtModel = holtExponentialSmoothing(cleanY);
  if (holtModel) {
    models.push({ name: "Holt", model: holtModel, weight: 0.6 });
    modelWeights.push(0.6);
  }

  // 4. Weighted Moving Average baseline
  const wmaBaseline = weightedMovingAverage(cleanY);
  const recentTrend =
    cleanY.length > 1 ? (cleanY[cleanY.length - 1] - cleanY[0]) / cleanY.length : 0;
  const wmaModel = {
    predict: (steps) => {
      return wmaBaseline + recentTrend * steps * 0.3;
    },
  };
  models.push({ name: "WMA", model: wmaModel, weight: 0.5 });
  modelWeights.push(0.5);

  if (models.length === 0) {
    return { canPredict: false, reason: "No valid models could be trained" };
  }

  // Normalize weights
  const totalWeight = modelWeights.reduce((a, b) => a + b, 0);
  const normalizedWeights =
    totalWeight > 0
      ? modelWeights.map((w) => w / totalWeight)
      : modelWeights.map(() => 1 / modelWeights.length);

  // Get last date and x position
  const lastRecord = validRecords[validRecords.length - 1];
  const lastDate = new Date(lastRecord.dateTo || lastRecord.dateFrom);
  const lastX =
    (lastDate.getTime() - baseDate) / (1000 * 60 * 60 * 24);

  // Generate ensemble predictions
  const predictions = [];
  let totalPredicted = 0;
  const minValue = Math.max(0, Math.min(...cleanY) * 0.5);
  const maxValue = Math.max(...cleanY) * 2;
  const avgValue = mean(cleanY);

  for (let day = 1; day <= predictionDays; day++) {
    const futureX = lastX + day;
    let ensemblePrediction = 0;

    // Weighted ensemble prediction
    models.forEach((m, i) => {
      let pred;
      try {
        if (m.name === "Linear" || m.name === "Polynomial") {
          pred = m.model.predict(futureX);
        } else if (m.name === "Holt") {
          pred = m.model.predict(day);
        } else {
          pred = m.model.predict(day);
        }
      } catch (e) {
        pred = avgValue;
      }

      // Clamp prediction to reasonable bounds
      if (typeof pred !== "number" || isNaN(pred)) {
        pred = avgValue;
      }
      pred = Math.max(minValue, Math.min(maxValue, pred));
      ensemblePrediction += pred * normalizedWeights[i];
    });

    // Apply dampening for far future predictions (reduce extreme values)
    const dampeningFactor = 1 / (1 + 0.01 * day);
    ensemblePrediction = avgValue + (ensemblePrediction - avgValue) * dampeningFactor;

    // Ensure non-negative
    ensemblePrediction = Math.max(0, ensemblePrediction);

    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + day);

    predictions.push({
      date: futureDate.toISOString().split("T")[0],
      day,
      predicted: parseFloat(ensemblePrediction.toFixed(4)),
    });

    totalPredicted += ensemblePrediction;
  }

  // Calculate ensemble accuracy (cross-validation on training data)
  const cvPredictions = cleanX.map((x, i) => {
    let pred = 0;
    models.forEach((m, j) => {
      let p;
      try {
        if (m.name === "Linear" || m.name === "Polynomial") {
          p = m.model.predict(x);
        } else if (m.name === "Holt") {
          p = m.model.predict(i + 1);
        } else {
          p = m.model.predict(i + 1);
        }
      } catch (e) {
        p = avgValue;
      }
      if (typeof p !== "number" || isNaN(p)) p = avgValue;
      pred += Math.max(0, p) * normalizedWeights[j];
    });
    return pred;
  });

  // Calculate MAPE (Mean Absolute Percentage Error)
  let mapeSum = 0;
  let mapeCount = 0;
  cleanY.forEach((actual, i) => {
    if (actual !== 0) {
      mapeSum += Math.abs((actual - cvPredictions[i]) / actual);
      mapeCount++;
    }
  });
  const mape = mapeCount > 0 ? mapeSum / mapeCount : 0.5;

  // Convert MAPE to accuracy percentage
  const accuracy = Math.max(0, Math.min(100, (1 - mape) * 100));

  // Calculate R-squared for ensemble
  const yMean = mean(cleanY);
  const ssTot = cleanY.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
  const ssRes = cleanY.reduce(
    (acc, y, i) => acc + Math.pow(y - cvPredictions[i], 2),
    0
  );
  const ensembleRSquared = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  // Confidence intervals (using standard deviation)
  const predictionStd = standardDeviation(cvPredictions);
  const confidenceMargin = predictionStd * 1.96; // 95% confidence

  return {
    canPredict: true,
    predictions,
    totalPredicted: parseFloat(totalPredicted.toFixed(4)),
    dailyAverage: parseFloat((totalPredicted / predictionDays).toFixed(4)),
    accuracy: parseFloat(accuracy.toFixed(2)),
    rSquared: parseFloat(ensembleRSquared.toFixed(4)),
    confidenceMargin: parseFloat(confidenceMargin.toFixed(4)),
    dataPointsUsed: validRecords.length,
    cleanDataPoints: cleanX.length,
    predictionDays,
    modelsUsed: models.map((m) => m.name),
    historicalAverage: parseFloat(avgValue.toFixed(4)),
    trend: linearModel
      ? linearModel.slope > 0
        ? "increasing"
        : "decreasing"
      : "stable",
    trendStrength: linearModel
      ? parseFloat(Math.abs(linearModel.slope).toFixed(6))
      : 0,
  };
};

// ============================================
// ELECTRICITY PREDICTION
// ============================================

export const predictElectricity = (records, predictionDays) => {
  const result = ensemblePredict(
    records,
    predictionDays,
    "electricityUsed",
    "dailyAvgCarbon"
  );

  if (!result.canPredict) return result;

  // Map predictions with both carbon and electricity values
  const emissionFactor = 0.4;

  const enrichedPredictions = result.predictions.map((p) => ({
    ...p,
    predictedCarbon: p.predicted,
    predictedElectricity: parseFloat((p.predicted / emissionFactor).toFixed(4)),
  }));

  return {
    ...result,
    predictions: enrichedPredictions,
    totalPredictedCarbon: result.totalPredicted,
    totalPredictedElectricity: parseFloat(
      (result.totalPredicted / emissionFactor).toFixed(4)
    ),
    movingAvgDailyCarbon: result.dailyAverage,
  };
};

// ============================================
// TRANSPORT PREDICTION
// ============================================

export const predictTransport = (records, predictionDays = 30) => {
  const result = ensemblePredict(
    records,
    predictionDays,
    "kmDriven",
    "dailyAvgCarbon"
  );

  if (!result.canPredict) return result;

  // Calculate average km per carbon unit
  const validRecords = records.filter(
    (r) =>
      typeof r.dailyAvgKm === "number" &&
      !isNaN(r.dailyAvgKm) &&
      typeof r.dailyAvgCarbon === "number" &&
      !isNaN(r.dailyAvgCarbon) &&
      r.dailyAvgCarbon > 0
  );

  const avgKmPerCarbon =
    validRecords.length > 0
      ? mean(validRecords.map((r) => r.dailyAvgKm)) /
        mean(validRecords.map((r) => r.dailyAvgCarbon))
      : 1;

  const enrichedPredictions = result.predictions.map((p) => ({
    ...p,
    predictedCarbon: p.predicted,
    predictedKm: parseFloat((p.predicted * avgKmPerCarbon).toFixed(4)),
  }));

  return {
    ...result,
    predictions: enrichedPredictions,
    totalPredictedCarbon: result.totalPredicted,
    totalPredictedKm: parseFloat(
      (result.totalPredicted * avgKmPerCarbon).toFixed(4)
    ),
    movingAvgDailyCarbon: result.dailyAverage,
  };
};

// ============================================
// DASHBOARD STATISTICS
// ============================================

const formatMonthLabel = (monthStr) => {
  try {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const monthIndex = parseInt(month, 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${monthNames[monthIndex]} ${year}`;
    }
    return monthStr;
  } catch (e) {
    return monthStr || "";
  }
};

const formatDateShort = (dateValue) => {
  try {
    if (!dateValue) return "Unknown";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "Unknown";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch (e) {
    return "Unknown";
  }
};

export const calculateDashboardStats = (electricityRecords = [], transportRecords = []) => {
  // Ensure arrays
  const elecRecords = Array.isArray(electricityRecords) ? electricityRecords : [];
  const transRecords = Array.isArray(transportRecords) ? transportRecords : [];

  const stats = {
    electricity: {
      totalCarbon: 0,
      totalUsage: 0,
      recordCount: 0,
      avgDailyCarbon: 0,
      trend: "stable",
    },
    transport: {
      totalCarbon: 0,
      totalKm: 0,
      totalFuel: 0,
      recordCount: 0,
      avgDailyCarbon: 0,
      trend: "stable",
    },
    combined: {
      totalCarbon: 0,
      carbonByMonth: [],
      recentActivity: [],
    },
  };

  // Electricity stats
  if (elecRecords.length > 0) {
    stats.electricity.recordCount = elecRecords.length;
    stats.electricity.totalCarbon = elecRecords.reduce(
      (sum, r) => sum + (r.carbonEmitted || 0),
      0
    );
    stats.electricity.totalUsage = elecRecords.reduce(
      (sum, r) => sum + (r.electricityUsed || 0),
      0
    );

    const dailyAvgs = elecRecords
      .map((r) => r.dailyAvgCarbon)
      .filter((v) => typeof v === "number" && !isNaN(v));

    stats.electricity.avgDailyCarbon =
      dailyAvgs.length > 0
        ? dailyAvgs.reduce((a, b) => a + b, 0) / dailyAvgs.length
        : 0;

    // Calculate trend
    if (elecRecords.length >= 2) {
      const sorted = [...elecRecords]
        .filter((r) => isValidDate(r.dateFrom))
        .sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));

      if (sorted.length >= 2) {
        const recent = sorted.slice(-Math.min(3, sorted.length));
        const earlier = sorted.slice(0, Math.min(3, sorted.length));

        const recentAvg =
          recent.reduce((sum, r) => sum + (r.dailyAvgCarbon || 0), 0) /
          recent.length;
        const earlierAvg =
          earlier.reduce((sum, r) => sum + (r.dailyAvgCarbon || 0), 0) /
          earlier.length;

        if (earlierAvg > 0) {
          stats.electricity.trend =
            recentAvg > earlierAvg * 1.1
              ? "increasing"
              : recentAvg < earlierAvg * 0.9
              ? "decreasing"
              : "stable";
        }
      }
    }
  }

  // Transport stats
  if (transRecords.length > 0) {
    stats.transport.recordCount = transRecords.length;
    stats.transport.totalCarbon = transRecords.reduce(
      (sum, r) => sum + (r.carbonEmitted || 0),
      0
    );
    stats.transport.totalKm = transRecords.reduce(
      (sum, r) => sum + (r.kmDriven || 0),
      0
    );
    stats.transport.totalFuel = transRecords.reduce(
      (sum, r) => sum + (r.fuelUsedLiters || 0),
      0
    );

    const dailyAvgs = transRecords
      .map((r) => r.dailyAvgCarbon)
      .filter((v) => typeof v === "number" && !isNaN(v));

    stats.transport.avgDailyCarbon =
      dailyAvgs.length > 0
        ? dailyAvgs.reduce((a, b) => a + b, 0) / dailyAvgs.length
        : 0;

    // Calculate trend
    if (transRecords.length >= 2) {
      const sorted = [...transRecords]
        .filter((r) => isValidDate(r.dateFrom))
        .sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));

      if (sorted.length >= 2) {
        const recent = sorted.slice(-Math.min(3, sorted.length));
        const earlier = sorted.slice(0, Math.min(3, sorted.length));

        const recentAvg =
          recent.reduce((sum, r) => sum + (r.dailyAvgCarbon || 0), 0) /
          recent.length;
        const earlierAvg =
          earlier.reduce((sum, r) => sum + (r.dailyAvgCarbon || 0), 0) /
          earlier.length;

        if (earlierAvg > 0) {
          stats.transport.trend =
            recentAvg > earlierAvg * 1.1
              ? "increasing"
              : recentAvg < earlierAvg * 0.9
              ? "decreasing"
              : "stable";
        }
      }
    }
  }

  // Combined stats
  stats.combined.totalCarbon =
    stats.electricity.totalCarbon + stats.transport.totalCarbon;

  // Monthly breakdown - with safe date handling
  const allRecords = [
    ...elecRecords
      .filter((r) => isValidDate(r.dateFrom))
      .map((r) => ({
        ...r,
        type: "electricity",
        _dateFrom: r.dateFrom,
      })),
    ...transRecords
      .filter((r) => isValidDate(r.dateFrom))
      .map((r) => ({
        ...r,
        type: "transport",
        _dateFrom: r.dateFrom,
      })),
  ];

  // Sort by date
  allRecords.sort((a, b) => {
    const dateA = new Date(a._dateFrom);
    const dateB = new Date(b._dateFrom);
    return dateA - dateB;
  });

  // Group by month
  const monthlyData = {};
  allRecords.forEach((r) => {
    const month = safeGetMonth(r._dateFrom);
    if (month) {
      if (!monthlyData[month]) {
        monthlyData[month] = { electricity: 0, transport: 0 };
      }
      monthlyData[month][r.type] += r.carbonEmitted || 0;
    }
  });

  stats.combined.carbonByMonth = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      monthLabel: formatMonthLabel(month),
      electricity: parseFloat((data.electricity || 0).toFixed(2)),
      transport: parseFloat((data.transport || 0).toFixed(2)),
      total: parseFloat(
        ((data.electricity || 0) + (data.transport || 0)).toFixed(2)
      ),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Recent activity (last 10 records) - with safe date handling
  stats.combined.recentActivity = allRecords
    .slice(-10)
    .reverse()
    .map((r) => ({
      type: r.type,
      carbonEmitted: parseFloat((r.carbonEmitted || 0).toFixed(2)),
      date: safeFormatDate(r._dateFrom) || new Date().toISOString(),
      dateFormatted: formatDateShort(r._dateFrom),
      id: r._id ? r._id.toString() : Math.random().toString(36).substr(2, 9),
    }));

  return stats;
};