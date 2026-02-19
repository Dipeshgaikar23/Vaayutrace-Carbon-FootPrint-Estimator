import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const upcomingFeatures = [
  {
    icon: "🏭",
    title: "Factory Emissions",
    desc: "Track CO₂ from industrial production processes",
  },
  {
    icon: "⚙️",
    title: "Machinery Carbon",
    desc: "Monitor emissions from manufacturing equipment",
  },
  {
    icon: "📦",
    title: "Supply Chain",
    desc: "End-to-end supply chain carbon footprint analysis",
  },
  {
    icon: "♻️",
    title: "Waste Management",
    desc: "Track waste-related emissions and recycling impact",
  },
  {
    icon: "🔥",
    title: "Energy Consumption",
    desc: "Industrial energy usage and emission optimization",
  },
  {
    icon: "📊",
    title: "Compliance Reports",
    desc: "Generate regulatory compliance reports automatically",
  },
];

export default function Manufacturing() {
  return (
    <div className="min-h-screen bg-grid pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm mb-6">
            <span className="animate-pulse">🚧</span>
            Under Development
          </div>

          <div className="text-7xl mb-6 animate-float">🏭</div>

          <h1 className="text-4xl font-black text-white mb-4">
            Manufacturing{" "}
            <span className="gradient-text">Carbon Tracker</span>
          </h1>

          <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
            We're building a comprehensive industrial carbon footprint tracking
            system. This will help manufacturers monitor, analyze, and reduce
            their environmental impact.
          </p>
        </motion.div>

        {/* Coming Soon Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            What's Coming
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {upcomingFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -3 }}
                className="glass-card p-4 text-center"
              >
                <div className="text-3xl mb-2">{feature.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">
              Development Progress
            </span>
            <span className="text-sm font-bold text-purple-400">15%</span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "15%" }}
              transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Planning & Architecture Phase
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-3"
        >
          <p className="text-gray-400 text-sm mb-4">
            In the meantime, start tracking with our available modules:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/electricity"
              className="px-6 py-3 bg-gradient-to-r from-yellow-500/80 to-orange-500/80 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              ⚡ Electricity Tracker
            </Link>
            <Link
              to="/transport"
              className="px-6 py-3 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              🚗 Transport Tracker
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}