import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber, getCarbonLevel } from "../../utils/helpers";

export default function TransportResult() {
  const { currentResult } = useSelector((state) => state.transport);

  if (!currentResult) return null;

  const carbonLevel = getCarbonLevel(currentResult.carbonEmitted);

  return (
    <AnimatePresence>
      <motion.div
        key="transport-result"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">📊</span>
          <h3 className="font-bold text-white">Transport Emission Result</h3>
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              color: carbonLevel.color,
              backgroundColor: carbonLevel.bg,
            }}
          >
            {carbonLevel.level}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            {
              label: "Carbon Emitted",
              value: formatNumber(currentResult.carbonEmitted),
              unit: "kg CO₂",
              color: carbonLevel.color,
            },
            {
              label: "Fuel Used",
              value: formatNumber(currentResult.fuelUsedLiters),
              unit: "Liters",
              color: "#f59e0b",
            },
            {
              label: "KM Driven",
              value: formatNumber(currentResult.kmDriven, 0),
              unit: "km",
              color: "#0ea5e9",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-xl border text-center"
              style={{
                backgroundColor: `${stat.color}08`,
                borderColor: `${stat.color}30`,
              }}
            >
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className="text-xl font-bold font-mono" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.unit}</p>
            </motion.div>
          ))}
        </div>

        {/* Formula breakdown */}
        <div className="p-4 bg-dark-700 rounded-xl border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-2 font-medium">Formula Applied</p>
          <div className="font-mono text-xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Fuel Used:</span>
              <span className="text-yellow-400">
                {formatNumber(currentResult.kmDriven)} km ÷{" "}
                {formatNumber(currentResult.fuelEfficiencyKmpl)} kmpl ={" "}
                {formatNumber(currentResult.fuelUsedLiters)} L
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Emission Factor:</span>
              <span className="text-orange-400">
                {currentResult.fuelType === "petrol" ? "2.31" : "2.68"} kg CO₂/L (
                {currentResult.fuelType})
              </span>
            </div>
            <div className="border-t border-gray-700 pt-1 mt-1 flex items-center gap-2">
              <span className="text-gray-500">Result:</span>
              <span className="text-green-400 font-bold">
                {formatNumber(currentResult.fuelUsedLiters)} ×{" "}
                {currentResult.fuelType === "petrol" ? "2.31" : "2.68"} ={" "}
                {formatNumber(currentResult.carbonEmitted)} kg CO₂
              </span>
            </div>
          </div>
        </div>

        {currentResult.record && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 text-xs text-green-400"
          >
            <span>✅</span>
            <span>Saved to your records for prediction</span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}