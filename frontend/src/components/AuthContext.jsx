import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios to send cookies with every request
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = 'http://localhost:5000';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
    //   console.log('Checking authentication...');
      const response = await axios.get('/api/auth/verify');
    //   console.log('Verify response:', response.data);
      
      // Handle your backend format (response.data directly has user info)
      if (response.data && (response.data.user || response.data._id)) {
        const userData = response.data.user || {
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
        };
        setIsAuthenticated(true);
        setUser(userData);
        // console.log('User authenticated:', userData);
      } else {
        // console.log('No user data in verify response');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth verification failed:', error.response?.data || error.message);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    // console.log('Login called with user data:', userData);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state anyway
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, checkAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};