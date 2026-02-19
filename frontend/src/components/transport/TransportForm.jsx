import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  calculateTransport,
  calculateAndSaveTransport,
} from "../../redux/slices/transportSlice";
import { today, daysAgo } from "../../utils/helpers";

const FUEL_FACTORS = { petrol: 2.31, diesel: 2.68 };

export default function TransportForm() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.transport);

  const [mode, setMode] = useState("quick");
  const [form, setForm] = useState({
    kmDriven: "",
    fuelEfficiencyKmpl: "",
    fuelType: "petrol",
    dateFrom: daysAgo(30),
    dateTo: today(),
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const estimatedFuel =
    form.kmDriven && form.fuelEfficiencyKmpl
      ? (parseFloat(form.kmDriven) / parseFloat(form.fuelEfficiencyKmpl)).toFixed(2)
      : null;

  const estimatedCarbon =
    estimatedFuel
      ? (parseFloat(estimatedFuel) * FUEL_FACTORS[form.fuelType]).toFixed(2)
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      kmDriven: parseFloat(form.kmDriven),
      fuelEfficiencyKmpl: parseFloat(form.fuelEfficiencyKmpl),
      fuelType: form.fuelType,
    };

    if (mode === "save") {
      if (!form.dateFrom || !form.dateTo) {
        toast.error("Please select a date range");
        return;
      }
      if (new Date(form.dateFrom) > new Date(form.dateTo)) {
        toast.error("Start date must be before end date");
        return;
      }

      const result = await dispatch(
        calculateAndSaveTransport({
          ...payload,
          dateFrom: form.dateFrom,
          dateTo: form.dateTo,
        })
      );

      if (calculateAndSaveTransport.fulfilled.match(result)) {
        toast.success("✅ Transport emission saved!");
      } else {
        toast.error(result.payload || "Failed to save");
      }
    } else {
      const result = await dispatch(calculateTransport(payload));
      if (calculateTransport.fulfilled.match(result)) {
        toast.success("🚗 Transport carbon calculated!");
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
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-xl">
          🚗
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            Transport Carbon Calculator
          </h2>
          <p className="text-xs text-gray-400">
            Petrol: 2.31 kg CO₂/L • Diesel: 2.68 kg CO₂/L
          </p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 p-1 bg-dark-700 rounded-lg mb-5">
        <button
          onClick={() => setMode("quick")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            mode === "quick"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
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
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
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
        {/* Fuel Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Fuel Type
          </label>
          <div className="flex gap-2">
            {["petrol", "diesel"].map((fuel) => (
              <button
                key={fuel}
                type="button"
                onClick={() => setForm((p) => ({ ...p, fuelType: fuel }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all border ${
                  form.fuelType === fuel
                    ? fuel === "petrol"
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                      : "bg-gray-500/20 text-gray-300 border-gray-500/40"
                    : "border-gray-700 text-gray-500 hover:border-gray-600"
                }`}
              >
                {fuel === "petrol" ? "⛽" : "🛢️"} {fuel}
                <span className="block text-xs opacity-60 mt-0.5">
                  {FUEL_FACTORS[fuel]} kg CO₂/L
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* KM Driven */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            KM Driven
          </label>
          <div className="relative">
            <input
              type="number"
              name="kmDriven"
              value={form.kmDriven}
              onChange={handleChange}
              placeholder="e.g., 500"
              min="0"
              step="0.1"
              required
              className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm input-glow transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              km
            </span>
          </div>
        </div>

        {/* Fuel Efficiency */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Fuel Efficiency
          </label>
          <div className="relative">
            <input
              type="number"
              name="fuelEfficiencyKmpl"
              value={form.fuelEfficiencyKmpl}
              onChange={handleChange}
              placeholder="e.g., 15"
              min="0.1"
              step="0.1"
              required
              className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm input-glow transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              km/L
            </span>
          </div>
        </div>

        {/* Live estimate */}
        {estimatedCarbon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl font-mono text-xs"
          >
            <div className="flex justify-between text-gray-400">
              <span>Estimated fuel: {estimatedFuel} L</span>
              <span className="text-blue-400 font-bold">
                ~{estimatedCarbon} kg CO₂
              </span>
            </div>
          </motion.div>
        )}

        {/* Date Range */}
        {mode === "save" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
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
                className="w-full px-3 py-3 bg-dark-700 border border-gray-700 rounded-xl text-white text-sm input-glow"
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
                className="w-full px-3 py-3 bg-dark-700 border border-gray-700 rounded-xl text-white text-sm input-glow"
              />
            </div>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.99 }}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 spinner border-white/30 border-t-white" />
              Calculating...
            </>
          ) : (
            <>
              <span>🚗</span>
              {mode === "save" ? "Calculate & Save" : "Calculate Carbon"}
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}