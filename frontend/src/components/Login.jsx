import React, { useState } from 'react';
import { Leaf, AlertCircle, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const Login = ({ onClose }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login' 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

    //   console.log('Sending request to:', `http://localhost:5000${endpoint}`);

      const response = await axios.post(
        `http://localhost:5000${endpoint}`, 
        payload,
        { withCredentials: true }
      );
      
    //   console.log('Response:', response.data);
      
      // Handle your current backend format
      const userData = {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
      };
      
      login(userData);
      
      // Close the login modal
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        )}

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <Leaf className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Carbon Footprint Tracker</h1>
          <p className="text-gray-600">Track and reduce your environmental impact</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              mode === 'login' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              mode === 'register' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              mode === 'login' ? 'Login' : 'Create Account'
            )}
          </button>
        </form>

        {onClose && (
          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Continue without login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;