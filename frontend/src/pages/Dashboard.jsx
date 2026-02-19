import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { fetchDashboardStats } from "../redux/slices/dashboardSlice";
import Loader from "../components/common/Loader";
import { formatNumber, getCarbonLevel } from "../utils/helpers";

// Animated counter component
const AnimatedCounter = ({ value, decimals = 0, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    if (start === end) return;

    const incrementTime = duration / Math.abs(end - start);
    const timer = setInterval(() => {
      start += end > start ? 1 : -1;
      setDisplayValue(start);
      if (start === Math.floor(end)) {
        setDisplayValue(end);
        clearInterval(timer);
      }
    }, Math.max(incrementTime, 10));

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{formatNumber(displayValue, decimals)}</span>;
};

import React from "react";

const StatCard = ({ icon, title, value, unit, color, trend, subtitle }) => {
  const trendColors = {
    increasing: "#ef4444",
    decreasing: "#22c55e",
    stable: "#6b7280",
  };

  const trendIcons = {
    increasing: "📈",
    decreasing: "📉",
    stable: "➡️",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="glass-card p-5 relative overflow-hidden group"
    >
      {/* Background glow */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ backgroundColor: color }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
          {trend && (
            <div
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: `${trendColors[trend]}15`,
                color: trendColors[trend],
              }}
            >
              <span>{trendIcons[trend]}</span>
              <span className="capitalize">{trend}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-black font-mono" style={{ color }}>
          <AnimatedCounter value={value} decimals={value % 1 !== 0 ? 2 : 0} />
          <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
        </p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
};

const EnvironmentCard = ({ icon, title, value, description, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    className="p-4 rounded-xl text-center border"
    style={{ backgroundColor: `${color}08`, borderColor: `${color}30` }}
  >
    <div className="text-3xl mb-2">{icon}</div>
    <p className="text-xl font-bold font-mono" style={{ color }}>
      {formatNumber(value, value < 10 ? 1 : 0)}
    </p>
    <p className="text-xs text-gray-400 font-medium">{title}</p>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
  </motion.div>
);

const COLORS = ["#00ff88", "#0ea5e9", "#f59e0b", "#8b5cf6"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-xs border border-green-500/20">
        <p className="text-gray-400 mb-2 font-medium">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="flex justify-between gap-4" style={{ color: p.color }}>
            <span>{p.name}:</span>
            <span className="font-mono font-bold">{formatNumber(p.value)} kg</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { stats, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(fetchDashboardStats());
  }, [isAuthenticated, dispatch, navigate]);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-grid pt-20 flex items-center justify-center">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const pieData = stats
    ? [
        { name: "Electricity", value: stats.electricity.totalCarbon, color: "#f59e0b" },
        { name: "Transport", value: stats.transport.totalCarbon, color: "#0ea5e9" },
      ].filter((d) => d.value > 0)
    : [];

  const hasData = stats && (stats.electricity.recordCount > 0 || stats.transport.recordCount > 0);

  return (
    <div className="min-h-screen bg-grid pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">
                Welcome back,{" "}
                <span className="gradient-text">{user?.name?.split(" ")[0]}</span>! 👋
              </h1>
              <p className="text-gray-400">
                Here's your carbon footprint overview
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/electricity"
                className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl text-sm font-medium hover:bg-yellow-500/20 transition-all"
              >
                ⚡ Add Electricity
              </Link>
              <Link
                to="/transport"
                className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-500/20 transition-all"
              >
                🚗 Add Transport
              </Link>
            </div>
          </div>
        </motion.div>

        {!hasData ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <div className="text-6xl mb-6">📊</div>
            <h2 className="text-2xl font-bold text-white mb-3">
              No Data Yet
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Start tracking your carbon footprint by adding electricity or
              transport records. Your dashboard will come to life!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/electricity"
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-dark-900 font-bold rounded-xl hover:opacity-90 transition-all"
              >
                ⚡ Track Electricity
              </Link>
              <Link
                to="/transport"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition-all"
              >
                🚗 Track Transport
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon="🌍"
                title="Total Carbon Footprint"
                value={stats?.combined.totalCarbon || 0}
                unit="kg CO₂"
                color="#00ff88"
                subtitle="All time emissions"
              />
              <StatCard
                icon="⚡"
                title="Electricity Carbon"
                value={stats?.electricity.totalCarbon || 0}
                unit="kg CO₂"
                color="#f59e0b"
                trend={stats?.electricity.trend}
                subtitle={`${stats?.electricity.recordCount || 0} records`}
              />
              <StatCard
                icon="🚗"
                title="Transport Carbon"
                value={stats?.transport.totalCarbon || 0}
                unit="kg CO₂"
                color="#0ea5e9"
                trend={stats?.transport.trend}
                subtitle={`${stats?.transport.recordCount || 0} records`}
              />
              <StatCard
                icon="📊"
                title="Total Records"
                value={
                  (stats?.electricity.recordCount || 0) +
                  (stats?.transport.recordCount || 0)
                }
                unit="entries"
                color="#8b5cf6"
                subtitle="Data points collected"
              />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Monthly Trend Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📈</span>
                  <h3 className="font-bold text-white">Monthly Carbon Trend</h3>
                </div>

                {stats?.combined.carbonByMonth?.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.combined.carbonByMonth}>
                        <defs>
                          <linearGradient id="elecGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="transGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: "#6b7280", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#6b7280", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="electricity"
                          name="Electricity"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          fill="url(#elecGrad)"
                        />
                        <Area
                          type="monotone"
                          dataKey="transport"
                          name="Transport"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          fill="url(#transGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>Add more records to see monthly trends</p>
                  </div>
                )}
              </motion.div>

              {/* Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🥧</span>
                  <h3 className="font-bold text-white">Carbon Distribution</h3>
                </div>

                {pieData.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => `${formatNumber(value)} kg CO₂`}
                          contentStyle={{
                            background: "#0a0f1e",
                            border: "1px solid rgba(0,255,136,0.2)",
                            borderRadius: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 flex items-center justify-center text-gray-500">
                    <p>No data yet</p>
                  </div>
                )}

                {/* Legend */}
                <div className="flex justify-center gap-4 mt-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-xs text-gray-400">{d.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Environmental Impact */}
            {stats?.environmentalImpact && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 mb-8"
              >
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-lg">🌱</span>
                  <h3 className="font-bold text-white">Environmental Impact</h3>
                  <span className="text-xs text-gray-500 ml-auto">
                    Based on {formatNumber(stats.combined.totalCarbon)} kg CO₂
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <EnvironmentCard
                    icon="🌳"
                    title="Trees Needed"
                    value={stats.environmentalImpact.treesNeeded}
                    description="To offset yearly"
                    color="#22c55e"
                  />
                  <EnvironmentCard
                    icon="🚙"
                    title="Equivalent Driving"
                    value={stats.environmentalImpact.equivalentDrivingKm}
                    description="Kilometers"
                    color="#f59e0b"
                  />
                  <EnvironmentCard
                    icon="✈️"
                    title="Domestic Flights"
                    value={stats.environmentalImpact.equivalentFlights}
                    description="One-way trips"
                    color="#8b5cf6"
                  />
                </div>
              </motion.div>
            )}

            {/* Recent Activity & Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🕐</span>
                  <h3 className="font-bold text-white">Recent Activity</h3>
                </div>

                {stats?.combined.recentActivity?.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {stats.combined.recentActivity.map((activity, i) => {
                      const level = getCarbonLevel(activity.carbonEmitted);
                      console.log(activity)
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between p-3 bg-dark-700 rounded-xl border border-gray-700/50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                                activity.type === "electricity"
                                  ? "bg-yellow-500/10"
                                  : "bg-blue-500/10"
                              }`}
                            >
                              {activity.type === "electricity" ? "⚡" : "🚗"}
                            </div>
                            <div>
                              <p className="text-sm text-white capitalize">
                                {activity.type}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </p>
                            </div>
                          </div>
                          <div
                            className="text-sm font-bold font-mono"
                            style={{ color: level.color }}
                          >
                            {formatNumber(activity.carbonEmitted)} kg
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent activity</p>
                  </div>
                )}
              </motion.div>

              {/* Insights & Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">💡</span>
                  <h3 className="font-bold text-white">Insights & Tips</h3>
                </div>

                <div className="space-y-3">
                  {/* Dynamic insights based on data */}
                  {stats?.electricity.totalCarbon > stats?.transport.totalCarbon && (
                    <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                      <p className="text-xs text-yellow-400 font-medium mb-1">
                        ⚡ Electricity Dominant
                      </p>
                      <p className="text-xs text-gray-400">
                        Your electricity usage contributes more to your carbon
                        footprint. Consider switching to renewable energy or using
                        energy-efficient appliances.
                      </p>
                    </div>
                  )}

                  {stats?.transport.totalCarbon > stats?.electricity.totalCarbon && (
                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                      <p className="text-xs text-blue-400 font-medium mb-1">
                        🚗 Transport Dominant
                      </p>
                      <p className="text-xs text-gray-400">
                        Transportation is your main carbon source. Consider
                        carpooling, public transit, or cycling for shorter trips.
                      </p>
                    </div>
                  )}

                  {stats?.electricity.trend === "increasing" && (
                    <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                      <p className="text-xs text-red-400 font-medium mb-1">
                        📈 Rising Electricity Emissions
                      </p>
                      <p className="text-xs text-gray-400">
                        Your electricity carbon is trending up. Check for energy
                        leaks or inefficient appliances.
                      </p>
                    </div>
                  )}

                  {stats?.electricity.trend === "decreasing" && (
                    <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
                      <p className="text-xs text-green-400 font-medium mb-1">
                        📉 Great Progress!
                      </p>
                      <p className="text-xs text-gray-400">
                        Your electricity emissions are decreasing. Keep up the
                        good work!
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                    <p className="text-xs text-purple-400 font-medium mb-1">
                      🔮 Prediction Ready
                    </p>
                    <p className="text-xs text-gray-400">
                      {stats?.electricity.recordCount >= 2 && stats?.transport.recordCount >= 2
                        ? "You have enough data for predictions in both domains!"
                        : `Add more records to unlock AI predictions. Need ${
                            Math.max(0, 2 - (stats?.electricity.recordCount || 0))
                          } more electricity and ${
                            Math.max(0, 2 - (stats?.transport.recordCount || 0))
                          } more transport records.`}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <p className="text-xs text-gray-500 mb-3">Quick Actions</p>
                  <div className="flex gap-2">
                    <Link
                      to="/electricity"
                      className="flex-1 py-2 text-center text-xs bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-all"
                    >
                      ⚡ Electricity Prediction
                    </Link>
                    <Link
                      to="/transport"
                      className="flex-1 py-2 text-center text-xs bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all"
                    >
                      🚗 Transport Prediction
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}