import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { fetchElectricityPrediction } from "../../redux/slices/electricitySlice";
import { formatNumber, getAccuracyLabel } from "../../utils/helpers";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-xs border border-green-500/20">
        <p className="text-gray-400 mb-2 font-medium">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="flex justify-between gap-4" style={{ color: p.color }}>
            <span>{p.name}:</span>
            <span className="font-mono">{formatNumber(p.value)} {p.name.includes("Carbon") ? "kg CO₂" : "kWh"}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ElectricityPrediction() {
  const dispatch = useDispatch();
  const { canPredict, recordCount, prediction, predicting } = useSelector(
    (state) => state.electricity
  );

  const [predictionDays, setPredictionDays] = useState(10);
  const [activeTab, setActiveTab] = useState("carbon");

  const handlePredict = async () => {
    if (!canPredict) {
      toast.warning(`Need at least 2 records. You have ${recordCount}.`);
      return;
    }

    const result = await dispatch(fetchElectricityPrediction(predictionDays));

    if (fetchElectricityPrediction.fulfilled.match(result)) {
      if (result.payload.data.canPredict) {
        toast.success(`🔮 Prediction generated with ${formatNumber(result.payload.data.accuracy, 1)}% accuracy!`);
      } else {
        toast.warning(result.payload.data.reason);
      }
    } else {
      toast.error("Failed to generate prediction");
    }
  };

  const accuracyInfo = prediction?.accuracy ? getAccuracyLabel(prediction.accuracy) : null;

  const chartData = prediction?.predictions?.map((p) => ({
    date: new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    "Predicted Carbon": p.predictedCarbon,
    "Predicted Electricity": p.predictedElectricity,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl">
          🔮
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">AI Carbon Prediction</h2>
          <p className="text-xs text-gray-400">
            Ensemble ML model • {recordCount} record{recordCount !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      {/* Config */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1.5">Predict Next</label>
          <select
            value={predictionDays}
            onChange={(e) => setPredictionDays(parseInt(e.target.value))}
            className="w-full px-3 py-2.5 bg-dark-700 border border-gray-700 rounded-xl text-white text-sm input-glow transition-all"
          >
            <option className="text-white bg-slate-900" value={7}>7 Days</option>
            <option className="text-white bg-slate-900" value={10}>10 Days</option>
            <option className="text-white bg-slate-900" value={15}>15 Days</option>
            <option className="text-white bg-slate-900" value={30}>30 Days</option>
          </select>
        </div>
        <div className="flex items-end">
          <motion.button
            whileHover={{ scale: canPredict ? 1.02 : 1 }}
            whileTap={{ scale: canPredict ? 0.98 : 1 }}
            onClick={handlePredict}
            disabled={!canPredict || predicting}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {predicting ? (
              <>
                <div className="w-3 h-3 spinner border-white/30 border-t-white" />
                Analyzing...
              </>
            ) : (
              <>🔮 Predict</>
            )}
          </motion.button>
        </div>
      </div>

      {!canPredict && (
        <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl mb-4">
          <p className="text-xs text-yellow-400">
            ⚠️ Need at least <strong>2 records</strong> for predictions. Add {2 - recordCount} more!
          </p>
        </div>
      )}

      <AnimatePresence>
        {prediction && prediction.canPredict && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-2">
              <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl text-center">
                <p className="text-xs text-gray-400 mb-1">Total CO₂</p>
                <p className="text-lg font-bold text-green-400 font-mono">
                  {formatNumber(prediction.totalPredictedCarbon)}
                </p>
                <p className="text-xs text-gray-500">kg CO₂</p>
              </div>
              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl text-center">
                <p className="text-xs text-gray-400 mb-1">Daily Avg</p>
                <p className="text-lg font-bold text-blue-400 font-mono">
                  {formatNumber(prediction.dailyAverage)}
                </p>
                <p className="text-xs text-gray-500">kg/day</p>
              </div>
              <div
                className="p-3 rounded-xl text-center border"
                style={{
                  backgroundColor: `${accuracyInfo?.color}08`,
                  borderColor: `${accuracyInfo?.color}30`,
                }}
              >
                <p className="text-xs text-gray-400 mb-1">Accuracy</p>
                <p className="text-lg font-bold font-mono" style={{ color: accuracyInfo?.color }}>
                  {formatNumber(prediction.accuracy, 1)}%
                </p>
                <p className="text-xs" style={{ color: accuracyInfo?.color }}>
                  {accuracyInfo?.label}
                </p>
              </div>
              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl text-center">
                <p className="text-xs text-gray-400 mb-1">Trend</p>
                <p className="text-lg font-bold text-purple-400">
                  {prediction.trend === "increasing" ? "📈" : prediction.trend === "decreasing" ? "📉" : "➡️"}
                </p>
                <p className="text-xs text-purple-400 capitalize">{prediction.trend}</p>
              </div>
            </div>

            {/* Chart Tabs */}
            <div className="flex gap-1 p-1 bg-dark-700 rounded-lg">
              {["carbon", "electricity"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                    activeTab === tab ? "bg-green-500/20 text-green-400" : "text-gray-400"
                  }`}
                >
                  {tab === "carbon" ? "🌿 CO₂ Emission" : "⚡ Electricity"}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="elecGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.floor(chartData.length / 5)}
                  />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={prediction.historicalAverage}
                    stroke="#6b7280"
                    strokeDasharray="3 3"
                    label={{ value: "Avg", fill: "#6b7280", fontSize: 10 }}
                  />
                  {activeTab === "carbon" ? (
                    <Area
                      type="monotone"
                      dataKey="Predicted Carbon"
                      stroke="#00ff88"
                      strokeWidth={2}
                      fill="url(#carbonGrad)"
                      dot={false}
                    />
                  ) : (
                    <Area
                      type="monotone"
                      dataKey="Predicted Electricity"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      fill="url(#elecGrad)"
                      dot={false}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Model Info */}
            <div className="p-3 bg-dark-700 rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                <span>🧠 Ensemble Model: {prediction.modelsUsed?.join(" + ")}</span>
                <span>R² = {formatNumber(prediction.rSquared, 4)}</span>
                <span>±{formatNumber(prediction.confidenceMargin, 2)} margin</span>
                <span>{prediction.cleanDataPoints}/{prediction.dataPointsUsed} clean points</span>
              </div>
            </div>
          </motion.div>
        )}

        {prediction && !prediction.canPredict && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-center"
          >
            <p className="text-yellow-400 text-sm">{prediction.reason}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}