import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber, getCarbonLevel } from "../../utils/helpers";

const StatCard = ({ label, value, unit, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex-1 p-4 rounded-xl border"
    style={{
      backgroundColor: `${color}08`,
      borderColor: `${color}30`,
    }}
  >
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className="text-2xl font-bold font-mono" style={{ color }}>
      {value}
    </p>
    <p className="text-xs text-gray-500 mt-0.5">{unit}</p>
  </motion.div>
);

export default function ElectricityResult() {
  const { currentResult } = useSelector((state) => state.electricity);

  if (!currentResult) return null;

  const carbonLevel = getCarbonLevel(currentResult.carbonEmitted);

  return (
    <AnimatePresence>
      <motion.div
        key="result"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">📊</span>
          <h3 className="font-bold text-white">Calculation Result</h3>
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

        <div className="flex gap-3 mb-4">
          <StatCard
            label="Carbon Emitted"
            value={formatNumber(currentResult.carbonEmitted)}
            unit="kg CO₂"
            color={carbonLevel.color}
          />
          <StatCard
            label="Electricity Used"
            value={formatNumber(currentResult.electricityUsed)}
            unit="kWh"
            color="#0ea5e9"
          />
        </div>

        {/* Formula breakdown */}
        <div className="p-4 bg-dark-700 rounded-xl border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-2 font-medium">
            Formula Applied
          </p>
          <div className="font-mono text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Input:</span>
              <span className="text-blue-400">
                {formatNumber(currentResult.electricityUsed)} kWh
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Factor:</span>
              <span className="text-yellow-400">× 0.4 kg CO₂/kWh</span>
            </div>
            <div className="border-t border-gray-700 pt-1 mt-1 flex items-center gap-2">
              <span className="text-gray-500">Result:</span>
              <span className="text-green-400 font-bold">
                {formatNumber(currentResult.carbonEmitted)} kg CO₂
              </span>
            </div>
          </div>
        </div>

        {/* Saved indicator */}
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