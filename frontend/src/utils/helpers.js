export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined) return "—";
  return parseFloat(num).toFixed(decimals);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getCarbonLevel = (kg) => {
  if (kg < 50) return { level: "Low", color: "#00ff88", bg: "rgba(0,255,136,0.1)" };
  if (kg < 150) return { level: "Moderate", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" };
  if (kg < 300) return { level: "High", color: "#f97316", bg: "rgba(249,115,22,0.1)" };
  return { level: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
};

export const getAccuracyLabel = (accuracy) => {
  if (accuracy >= 80) return { label: "High Accuracy", color: "#00ff88" };
  if (accuracy >= 50) return { label: "Moderate Accuracy", color: "#f59e0b" };
  return { label: "Low Accuracy", color: "#f97316" };
};

export const today = () => new Date().toISOString().split("T")[0];

export const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
};