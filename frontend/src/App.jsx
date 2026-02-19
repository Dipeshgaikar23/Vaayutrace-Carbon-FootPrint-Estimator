import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { checkAuth } from "./redux/slices/authSlice";
import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Electricity from "./pages/Electricity";
import Transport from "./pages/Transport";
import Manufacturing from "./pages/Manufacturing";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/electricity" element={<Electricity />} />
          <Route path="/transport" element={<Transport />} />
          <Route path="/manufacturing" element={<Manufacturing />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="dark"
          limit={3}
        />
      </div>
    </BrowserRouter>
  );
}