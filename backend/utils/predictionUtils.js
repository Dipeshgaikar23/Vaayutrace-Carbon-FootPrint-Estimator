// Linear regression from scratch
const linearRegression = (xValues, yValues) => {
  const n = xValues.length;
  if (n < 2) return null;

  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
  const sumXX = xValues.reduce((acc, x) => acc + x * x, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const yMean = sumY / n;
  const ssTot = yValues.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
  const ssRes = xValues.reduce(
    (acc, x, i) => acc + Math.pow(yValues[i] - (slope * x + intercept), 2),
    0
  );
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, rSquared };
};

// Moving average
const movingAverage = (values, window = 3) => {
  if (values.length < window) window = values.length;
  const avg =
    values.slice(-window).reduce((a, b) => a + b, 0) /
    Math.min(window, values.length);
  return avg;
};

// Predict electricity for upcoming days
export const predictElectricity = (records, predictionDays) => {
  if (!records || records.length < 2) {
    return { canPredict: false, reason: "Need at least 2 records to predict" };
  }

  // Use timestamps as X, daily average carbon as Y
  const baseDate = new Date(records[0].dateFrom).getTime();
  const xValues = records.map((r) => {
    return (new Date(r.dateFrom).getTime() - baseDate) / (1000 * 60 * 60 * 24);
  });
  const yCarbonValues = records.map((r) => r.dailyAvgCarbon);
  const yElectricityValues = records.map((r) => r.dailyAvgElectricity);

  const carbonRegression = linearRegression(xValues, yCarbonValues);
  const electricityRegression = linearRegression(xValues, yElectricityValues);

  if (!carbonRegression || !electricityRegression) {
    return { canPredict: false, reason: "Insufficient data variation" };
  }

  // Get last date from most recent record
  const lastDate = new Date(records[records.length - 1].dateTo);
  const lastX =
    (lastDate.getTime() - baseDate) / (1000 * 60 * 60 * 24);

  // Generate predictions for each day
  const predictions = [];
  let totalPredictedCarbon = 0;
  let totalPredictedElectricity = 0;

  for (let day = 1; day <= predictionDays; day++) {
    const futureX = lastX + day;
    const predictedCarbon = Math.max(
      0,
      carbonRegression.slope * futureX + carbonRegression.intercept
    );
    const predictedElectricity = Math.max(
      0,
      electricityRegression.slope * futureX + electricityRegression.intercept
    );

    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + day);

    predictions.push({
      date: futureDate.toISOString().split("T")[0],
      predictedCarbon: parseFloat(predictedCarbon.toFixed(4)),
      predictedElectricity: parseFloat(predictedElectricity.toFixed(4)),
    });

    totalPredictedCarbon += predictedCarbon;
    totalPredictedElectricity += predictedElectricity;
  }

  const accuracy = Math.min(100, Math.max(0, carbonRegression.rSquared * 100));
  const movingAvgCarbon = movingAverage(yCarbonValues);

  return {
    canPredict: true,
    predictions,
    totalPredictedCarbon: parseFloat(totalPredictedCarbon.toFixed(4)),
    totalPredictedElectricity: parseFloat(totalPredictedElectricity.toFixed(4)),
    accuracy: parseFloat(accuracy.toFixed(2)),
    rSquared: parseFloat(carbonRegression.rSquared.toFixed(4)),
    movingAvgDailyCarbon: parseFloat(movingAvgCarbon.toFixed(4)),
    dataPointsUsed: records.length,
    predictionDays,
  };
};

// Predict transport for upcoming month
export const predictTransport = (records, predictionDays = 30) => {
  if (!records || records.length < 2) {
    return { canPredict: false, reason: "Need at least 2 records to predict" };
  }

  const baseDate = new Date(records[0].dateFrom).getTime();
  const xValues = records.map((r) => {
    return (new Date(r.dateFrom).getTime() - baseDate) / (1000 * 60 * 60 * 24);
  });
  const yCarbonValues = records.map((r) => r.dailyAvgCarbon);
  const yKmValues = records.map((r) => r.dailyAvgKm);

  const carbonRegression = linearRegression(xValues, yCarbonValues);
  const kmRegression = linearRegression(xValues, yKmValues);

  if (!carbonRegression || !kmRegression) {
    return { canPredict: false, reason: "Insufficient data variation" };
  }

  const lastDate = new Date(records[records.length - 1].dateTo);
  const lastX =
    (lastDate.getTime() - baseDate) / (1000 * 60 * 60 * 24);

  const predictions = [];
  let totalPredictedCarbon = 0;
  let totalPredictedKm = 0;

  for (let day = 1; day <= predictionDays; day++) {
    const futureX = lastX + day;
    const predictedCarbon = Math.max(
      0,
      carbonRegression.slope * futureX + carbonRegression.intercept
    );
    const predictedKm = Math.max(
      0,
      kmRegression.slope * futureX + kmRegression.intercept
    );

    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + day);

    predictions.push({
      date: futureDate.toISOString().split("T")[0],
      predictedCarbon: parseFloat(predictedCarbon.toFixed(4)),
      predictedKm: parseFloat(predictedKm.toFixed(4)),
    });

    totalPredictedCarbon += predictedCarbon;
    totalPredictedKm += predictedKm;
  }

  const accuracy = Math.min(100, Math.max(0, carbonRegression.rSquared * 100));
  const movingAvgCarbon = movingAverage(yCarbonValues);

  return {
    canPredict: true,
    predictions,
    totalPredictedCarbon: parseFloat(totalPredictedCarbon.toFixed(4)),
    totalPredictedKm: parseFloat(totalPredictedKm.toFixed(4)),
    accuracy: parseFloat(accuracy.toFixed(2)),
    rSquared: parseFloat(carbonRegression.rSquared.toFixed(4)),
    movingAvgDailyCarbon: parseFloat(movingAvgCarbon.toFixed(4)),
    dataPointsUsed: records.length,
    predictionDays,
  };
};