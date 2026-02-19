import { motion } from "framer-motion";

export default function Loader({ size = "md", text = "Loading..." }) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`${sizes[size]} rounded-full border-2 border-green-900 border-t-accent-green spinner`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-400"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-dark-900 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="relative w-20 h-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-400 spinner" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-teal-400 spinner" />
          <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-blue-400 spinner" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold gradient-text mb-1">VaayuTrace</h2>
          <p className="text-gray-400 text-sm">Initializing...</p>
        </motion.div>
      </div>
    </div>
  );
}