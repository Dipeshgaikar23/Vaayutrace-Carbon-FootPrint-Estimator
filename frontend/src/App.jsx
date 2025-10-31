import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import Login from './components/Login';
import Navbar from './components/Navbar';
import SingleDomainPredictor from './components/SingleDomainPredictor';
import History from './components/History';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('calculate');
  const [showLogin, setShowLogin] = useState(false);

  // Auto-show login modal if user tries to access history without being authenticated
  useEffect(() => {
    if (currentPage === 'history' && !isAuthenticated && !loading) {
      setShowLogin(true);
    }
  }, [currentPage, isAuthenticated, loading]);

  // Close login modal when user successfully authenticates
  useEffect(() => {
    if (isAuthenticated && showLogin) {
      setShowLogin(false);
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showLogin && !isAuthenticated) {
    return <Login onClose={() => {
      setShowLogin(false);
      setCurrentPage('calculate'); // Redirect to predict page if they close login
    }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        onLoginClick={() => setShowLogin(true)}
      />
      <div className="p-8">
        {currentPage === 'calculate' ? (
          <SingleDomainPredictor />
        ) : isAuthenticated ? (
          <History />
        ) : (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">Please login to view your prediction history</p>
            <button
              onClick={() => setShowLogin(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all"
            >
              Login / Register
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;