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
} from "recharts";
import { fetchTransportPrediction } from "../../redux/slices/transportSlice";
import { formatNumber, getAccuracyLabel } from "../../utils/helpers";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-xs border border-blue-500/20">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {formatNumber(p.value)}{" "}
            {p.name.includes("Carbon") ? "kg CO₂" : "km"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TransportPrediction() {
  const dispatch = useDispatch();
  const { canPredict, recordCount, prediction, predicting } = useSelector(
    (state) => state.transport
  );
  const [activeTab, setActiveTab] = useState("carbon");

  const handlePredict = async () => {
    if (!canPredict) {
      toast.warning(`Need at least 2 records. You have ${recordCount}.`);
      return;
    }

    const result = await dispatch(fetchTransportPrediction(30));

    if (fetchTransportPrediction.fulfilled.match(result)) {
      if (result.payload.data.canPredict) {
        toast.success("🔮 Next month prediction ready!");
      } else {
        toast.warning(result.payload.data.reason);
      }
    } else {
      toast.error("Prediction failed");
    }
  };

  const accuracyInfo = prediction?.accuracy
    ? getAccuracyLabel(prediction.accuracy)
    : null;

  const chartData = prediction?.predictions?.map((p) => ({
    date: new Date(p.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    "Predicted Carbon": p.predictedCarbon,
    "Predicted KM": p.predictedKm,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl">
          📅
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            Next Month Prediction
          </h2>
          <p className="text-xs text-gray-400">
            {recordCount} record{recordCount !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: canPredict ? 1.01 : 1 }}
        whileTap={{ scale: canPredict ? 0.99 : 1 }}
        onClick={handlePredict}
        disabled={!canPredict || predicting}
        className="w-full py-3 mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {predicting ? (
          <>
            <div className="w-4 h-4 spinner border-white/30 border-t-white" />
            Generating Prediction...
          </>
        ) : (
          <>📅 Predict Next 30 Days</>
        )}
      </motion.button>

      {!canPredict && (
        <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl mb-4">
          <p className="text-xs text-yellow-400">
            ⚠️ Save at least <strong>2 transport records</strong> to enable
            monthly predictions.
          </p>
        </div>
      )}

      <AnimatePresence>
        {prediction && prediction.canPredict && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4"
          >
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl text-center">
                <p className="text-xs text-gray-400 mb-1">Monthly CO₂</p>
                <p className="text-lg font-bold text-green-400 font-mono">
                  {formatNumber(prediction.totalPredictedCarbon)}
                </p>
                <p className="text-xs text-gray-500">kg CO₂</p>
              </div>
              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl text-center">
                <p className="text-xs text-gray-400 mb-1">Monthly KM</p>
                <p className="text-lg font-bold text-blue-400 font-mono">
                  {formatNumber(prediction.totalPredictedKm, 0)}
                </p>
                <p className="text-xs text-gray-500">km</p>
              </div>
              <div
                className="p-3 rounded-xl text-center border"
                style={{
                  backgroundColor: `${accuracyInfo?.color}08`,
                  borderColor: `${accuracyInfo?.color}30`,
                }}
              >
                <p className="text-xs text-gray-400 mb-1">Accuracy</p>
                <p
                  className="text-lg font-bold font-mono"
                  style={{ color: accuracyInfo?.color }}
                >
                  {formatNumber(prediction.accuracy, 1)}%
                </p>
                <p className="text-xs" style={{ color: accuracyInfo?.color }}>
                  {accuracyInfo?.label}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-dark-700 rounded-lg">
              {["carbon", "km"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeTab === tab
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-gray-400"
                  }`}
                >
                  {tab === "carbon" ? "🌿 CO₂" : "🛣️ KM Driven"}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="tCarbonGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="tKmGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.floor((chartData?.length || 1) / 5)}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {activeTab === "carbon" ? (
                    <Area
                      type="monotone"
                      dataKey="Predicted Carbon"
                      stroke="#00ff88"
                      strokeWidth={2}
                      fill="url(#tCarbonGrad)"
                      dot={false}
                    />
                  ) : (
                    <Area
                      type="monotone"
                      dataKey="Predicted KM"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      fill="url(#tKmGrad)"
                      dot={false}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 p-3 bg-dark-700 rounded-xl">
              <span>📈 Linear Regression Model</span>
              <span>R² = {formatNumber(prediction.rSquared, 4)}</span>
              <span>{prediction.dataPointsUsed} data points</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}