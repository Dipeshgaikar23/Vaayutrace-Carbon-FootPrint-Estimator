import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logoutUser } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";

const navLinks = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/dashboard", label: "Dashboard", icon: "📊", protected: true },
  { path: "/electricity", label: "Electricity", icon: "⚡" },
  { path: "/transport", label: "Transport", icon: "🚗" },
  { path: "/manufacturing", label: "Manufacturing", icon: "🏭" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-green-900/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8 }}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-teal-400 flex items-center justify-center text-sm"
            >
              🌍
            </motion.div>
            <span className="font-bold text-lg gradient-text">VaayuTrace</span>
          </Link>

          {/* Desktop Nav */}
          <div className=" md:flex items-center gap-1">
            {navLinks
              .filter((link) => !link.protected || isAuthenticated)
              .map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === link.path
                      ? "bg-green-900/30 text-green-400 border border-green-500/30"
                      : "text-gray-400 hover:text-green-400 hover:bg-green-900/20"
                    }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
          </div>

          {/* Auth Section */}
          <div className=" md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-900/20 border border-green-500/20">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-teal-400 flex items-center justify-center text-xs font-bold text-dark-900">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300">{user?.name}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/50 rounded-lg transition-all"
                >
                  Logout
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm text-gray-400 hover:text-green-400 border border-gray-700 hover:border-green-500/50 rounded-lg transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-green-500 to-teal-500 text-dark-900 rounded-lg hover:opacity-90 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-900/20 transition-all"
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-1">
              <motion.span
                animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-full bg-current"
              />
              <motion.span
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block h-0.5 w-full bg-current"
              />
              <motion.span
                animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-full bg-current"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-green-900/30 bg-dark-800/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === link.path
                      ? "bg-green-900/30 text-green-400"
                      : "text-gray-400 hover:text-green-400"
                    }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-green-900/30 pt-3 mt-3">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    Logout ({user?.name})
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 text-center px-3 py-2 text-sm border border-gray-700 text-gray-400 rounded-lg"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 text-center px-3 py-2 text-sm bg-gradient-to-r from-green-500 to-teal-500 text-dark-900 font-medium rounded-lg"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}