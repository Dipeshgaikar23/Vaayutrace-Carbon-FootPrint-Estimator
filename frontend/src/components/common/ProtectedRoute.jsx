import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { PageLoader } from "./Loader";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authChecking } = useSelector((state) => state.auth);

  if (authChecking) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}