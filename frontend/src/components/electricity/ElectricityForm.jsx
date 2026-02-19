import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  calculateElectricity,
  calculateAndSaveElectricity,
} from "../../redux/slices/electricitySlice";
import { today, daysAgo } from "../../utils/helpers";

export default function ElectricityForm() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.electricity);

  const [mode, setMode] = useState("quick"); // "quick" | "save"
  const [form, setForm] = useState({
    electricityUsed: "",
    dateFrom: daysAgo(7),
    dateTo: today(),
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.electricityUsed || parseFloat(form.electricityUsed) <= 0) {
      toast.error("Please enter valid electricity usage");
      return;
    }

    if (mode === "save" || (isAuthenticated && mode === "save")) {
      if (!form.dateFrom || !form.dateTo) {
        toast.error("Please select a date range");
        return;
      }
      if (new Date(form.dateFrom) > new Date(form.dateTo)) {
        toast.error("Start date must be before end date");
        return;
      }

      const result = await dispatch(
        calculateAndSaveElectricity({
          electricityUsed: parseFloat(form.electricityUsed),
          dateFrom: form.dateFrom,
          dateTo: form.dateTo,
        })
      );

      if (calculateAndSaveElectricity.fulfilled.match(result)) {
        toast.success("✅ Calculation saved successfully!");
      } else {
        toast.error(result.payload || "Failed to save");
      }
    } else {
      const result = await dispatch(
        calculateElectricity({
          electricityUsed: parseFloat(form.electricityUsed),
        })
      );

      if (calculateElectricity.fulfilled.match(result)) {
        toast.success("⚡ Carbon emission calculated!");
      } else {
        toast.error(result.payload || "Calculation failed");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-xl">
          ⚡
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            Electricity Carbon Calculator
          </h2>
          <p className="text-xs text-gray-400">
            Emission Factor: 0.4 kg CO₂ per kWh
          </p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 p-1 bg-dark-700 rounded-lg mb-5">
        <button
          onClick={() => setMode("quick")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            mode === "quick"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Quick Calculate
        </button>
        <button
          onClick={() => setMode("save")}
          disabled={!isAuthenticated}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            mode === "save"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "text-gray-400 hover:text-gray-300"
          } ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Calculate & Save
          {!isAuthenticated && (
            <span className="ml-1 text-xs">(Login required)</span>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Electricity Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Electricity Used (kWh)
          </label>
          <div className="relative">
            <input
              type="number"
              name="electricityUsed"
              value={form.electricityUsed}
              onChange={handleChange}
              placeholder="e.g., 250"
              min="0"
              step="0.01"
              required
              className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm input-glow transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 bg-dark-700 px-2">
              kWh
            </span>
          </div>
        </div>

        {/* Date Range - only for save mode */}
        {mode === "save" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Date From
              </label>
              <input
                type="date"
                name="dateFrom"
                value={form.dateFrom}
                onChange={handleChange}
                max={today()}
                className="w-full px-3 py-3 bg-dark-700 border border-gray-700 rounded-xl text-white text-sm input-glow transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Date To
              </label>
              <input
                type="date"
                name="dateTo"
                value={form.dateTo}
                onChange={handleChange}
                max={today()}
                className="w-full px-3 py-3 bg-dark-700 border border-gray-700 rounded-xl text-white text-sm input-glow transition-all"
              />
            </div>
          </motion.div>
        )}

        {/* Info Banner */}
        {mode === "quick" && (
          <div className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <span className="text-blue-400 text-xs mt-0.5">ℹ️</span>
            <p className="text-xs text-gray-400">
              Quick mode calculates carbon emission without saving. To store
              data for predictions, use{" "}
              <span className="text-green-400">Calculate & Save</span> (login
              required).
            </p>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.99 }}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-dark-900 font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 spinner" />
              Calculating...
            </>
          ) : (
            <>
              <span>⚡</span>
              {mode === "save" ? "Calculate & Save" : "Calculate Carbon"}
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}