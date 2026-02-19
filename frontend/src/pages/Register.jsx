import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { registerUser, clearError } from "../redux/slices/authSlice";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/electricity");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const result = await dispatch(
      registerUser({ name: form.name, email: form.email, password: form.password })
    );
    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created! Welcome to VaayuTrace 🌱");
      navigate("/electricity");
    }
  };

  const passwordStrength = (pass) => {
    if (pass.length === 0) return null;
    if (pass.length < 6) return { level: "Weak", color: "#ef4444", width: "33%" };
    if (pass.length < 10) return { level: "Good", color: "#f59e0b", width: "66%" };
    return { level: "Strong", color: "#00ff88", width: "100%" };
  };

  const strength = passwordStrength(form.password);

  return (
    <div className="min-h-screen bg-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-teal-400 flex items-center justify-center">
              🌍
            </div>
            <span className="text-2xl font-bold gradient-text">VaayuTrace</span>
          </Link>
          <p className="text-gray-400 mt-2 text-sm">
            Create your free account
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="John Doe"
                required
                minLength={2}
                className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm input-glow transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm input-glow transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Min. 6 characters"
                  required
                  className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm input-glow transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {strength && (
                <div className="mt-2">
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: strength.width }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: strength.color }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: strength.color }}>
                    {strength.level} password
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                placeholder="Repeat your password"
                required
                className="w-full px-4 py-3 bg-dark-700 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm input-glow transition-all"
              />
              {form.confirmPassword && (
                <p
                  className="text-xs mt-1"
                  style={{
                    color:
                      form.password === form.confirmPassword
                        ? "#00ff88"
                        : "#ef4444",
                  }}
                >
                  {form.password === form.confirmPassword
                    ? "✓ Passwords match"
                    : "✗ Passwords don't match"}
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-dark-900 font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 spinner border-dark-900/30 border-t-dark-900" />
                  Creating account...
                </>
              ) : (
                "🚀 Create Account"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-green-400 hover:text-green-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}