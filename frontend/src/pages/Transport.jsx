import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import TransportForm from "../components/transport/TransportForm";
import TransportResult from "../components/transport/TransportResult";
import TransportPrediction from "../components/transport/TransportPrediction";
import {
  fetchTransportRecords,
  deleteTransportRecord,
} from "../redux/slices/transportSlice";
import { formatNumber, formatDate, getCarbonLevel } from "../utils/helpers";

export default function Transport() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { records, recordCount } = useSelector((state) => state.transport);
  const [showRecords, setShowRecords] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTransportRecords());
    }
  }, [isAuthenticated, dispatch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    const result = await dispatch(deleteTransportRecord(id));
    if (deleteTransportRecord.fulfilled.match(result)) {
      toast.success("Record deleted");
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-grid pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl">
              🚗
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Transport Carbon Tracker
              </h1>
              <p className="text-sm text-gray-400">
                Track fuel consumption & predict monthly CO₂ emissions
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-6">
            <TransportForm />
            <TransportResult />
          </div>

          {/* Right */}
          <div className="space-y-6">
            {isAuthenticated ? (
              <>
                <TransportPrediction />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span>📋</span>
                      <h3 className="font-bold text-white">
                        Saved Records{" "}
                        <span className="text-sm font-normal text-gray-400">
                          ({recordCount})
                        </span>
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowRecords(!showRecords)}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {showRecords ? "Hide" : "Show All"}
                    </button>
                  </div>

                  {recordCount === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-4xl mb-2">🚗</p>
                      <p className="text-sm text-gray-400">
                        No records yet. Use{" "}
                        <span className="text-blue-400">Calculate & Save</span>{" "}
                        to store transport data.
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {showRecords && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 max-h-80 overflow-y-auto pr-1"
                        >
                          {[...records].reverse().map((record, i) => {
                            const level = getCarbonLevel(record.carbonEmitted);
                            return (
                              <motion.div
                                key={record._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between p-3 bg-dark-700 rounded-xl border border-gray-700/50 group"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span
                                      className="text-xs font-bold"
                                      style={{ color: level.color }}
                                    >
                                      {formatNumber(record.carbonEmitted)} kg CO₂
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      •
                                    </span>
                                    <span className="text-xs text-yellow-400">
                                      {formatNumber(record.kmDriven, 0)} km
                                    </span>
                                    <span
                                      className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                                        record.fuelType === "petrol"
                                          ? "bg-orange-500/20 text-orange-400"
                                          : "bg-gray-500/20 text-gray-300"
                                      }`}
                                    >
                                      {record.fuelType}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(record.dateFrom)} →{" "}
                                    {formatDate(record.dateTo)} (
                                    {record.durationDays}d)
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDelete(record._id)}
                                  className="ml-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-sm"
                                >
                                  🗑️
                                </button>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 text-center"
              >
                <div className="text-5xl mb-4">🔐</div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Login for Monthly Predictions
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Save transport records to get AI-powered next-month carbon
                  emission predictions.
                </p>
                <div className="space-y-2">
                  <a
                    href="/register"
                    className="block w-full py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl text-sm"
                  >
                    Create Free Account
                  </a>
                  <a
                    href="/login"
                    className="block w-full py-2.5 border border-blue-500/30 text-blue-400 rounded-xl text-sm"
                  >
                    Login
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}