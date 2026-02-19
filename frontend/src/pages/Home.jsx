import { useEffect, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const EarthScene = lazy(() => import("../three/EarthScene"));

const features = [
  {
    icon: "⚡",
    title: "Electricity Tracking",
    desc: "Monitor kWh consumption and calculate precise CO₂ emissions with predictive analytics.",
    color: "#f59e0b",
    path: "/electricity",
  },
  {
    icon: "🚗",
    title: "Transport Analysis",
    desc: "Track fuel consumption across petrol and diesel vehicles with monthly forecasting.",
    color: "#0ea5e9",
    path: "/transport",
  },
  {
    icon: "🏭",
    title: "Manufacturing",
    desc: "Industrial carbon footprint tracking. Coming soon with advanced monitoring.",
    color: "#8b5cf6",
    path: "/manufacturing",
    soon: true,
  },
];

const stats = [
  { value: "0.4", label: "kg CO₂ per kWh", icon: "⚡", unit: "Emission Factor" },
  { value: "2.31", label: "kg CO₂ per Liter", icon: "⛽", unit: "Petrol Factor" },
  { value: "2.68", label: "kg CO₂ per Liter ", icon: "🛢️", unit: "Diesel Factor" },
  { value: "ML", label: "Powered Predictions", icon: "🔮", unit: "Linear Regression" },
];

export default function Home() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-grid">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Earth Background */}
        <div className="absolute inset-0 opacity-40">
          <Suspense fallback={null}>
            <EarthScene />
          </Suspense>
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/20 via-transparent to-dark-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/80 via-transparent to-dark-900/80" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm mb-8"
          >
            <span className="animate-pulse-slow">🌍</span>
            Carbon Tracking & Prediction Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          >
            <span className="text-white">Vaayu</span>
            <span className="gradient-text">Trace</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Estimate, Track & Predict your{" "}
            <span className="text-green-400">Carbon Footprint</span> across
            Electricity, Transport & Manufacturing with{" "}
            <span className="text-blue-400">AI-powered predictions</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {isAuthenticated ? (
              <>
                <Link
                  to="/electricity"
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-dark-900 font-bold rounded-2xl hover:opacity-90 transition-all hover:scale-105 text-lg"
                >
                  ⚡ Start Tracking
                </Link>
                <Link
                  to="/dashboard"
                  className="px-8 py-4 border border-green-500/30 text-green-400 font-semibold rounded-2xl hover:bg-green-500/10 transition-all text-lg"
                >
                  📊 Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-dark-900 font-bold rounded-2xl hover:opacity-90 transition-all hover:scale-105 text-lg"
                >
                  🚀 Get Started Free
                </Link>
                <Link
                  to="/electricity"
                  className="px-8 py-4 border border-green-500/30 text-green-400 font-semibold rounded-2xl hover:bg-green-500/10 transition-all text-lg"
                >
                  ⚡ Try Without Login
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-green-500/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-green-400 rounded-full animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 text-center"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-black gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500">{stat.unit}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-3">
              Track Every{" "}
              <span className="gradient-text">Carbon Source</span>
            </h2>
            <p className="text-gray-400">
              Comprehensive coverage of your environmental impact
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -5 }}
              >
                <Link
                  to={feature.path}
                  className="block glass-card p-6 h-full hover:border-opacity-40 transition-all duration-300 group"
                  style={{
                    borderColor: `${feature.color}20`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {feature.title}
                    {feature.soon && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                        Soon
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                  <div
                    className="mt-4 text-sm font-medium flex items-center gap-1"
                    style={{ color: feature.color }}
                  >
                    {feature.soon ? "Coming Soon" : "Explore →"}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-3">
              How <span className="gradient-text">VaayuTrace</span> Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Input Your Data",
                desc: "Enter electricity usage in kWh or vehicle distance with fuel details.",
                icon: "📝",
              },
              {
                step: "02",
                title: "Instant Calculation",
                desc: "Get real-time carbon emission calculations using industry-standard formulas.",
                icon: "⚡",
              },
              {
                step: "03",
                title: "AI Prediction",
                desc: "Save records and get ML-powered forecasts for next 10-30 days.",
                icon: "🔮",
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-card p-6 relative"
              >
                <div className="absolute top-4 right-4 text-4xl font-black text-green-500/10">
                  {step.step}
                </div>
                <div className="text-3xl mb-4">{step.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-10 border-animate"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Track Your{" "}
                <span className="gradient-text">Carbon Impact?</span>
              </h2>
              <p className="text-gray-400 mb-8">
                Create a free account to save records and unlock AI-powered
                carbon emission predictions.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/register"
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-dark-900 font-bold rounded-xl hover:opacity-90 transition-all"
                >
                  🚀 Create Free Account
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 border border-green-500/30 text-green-400 font-semibold rounded-xl hover:bg-green-500/10 transition-all"
                >
                  Login
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}