import React from 'react';
import { Leaf, Zap, History, LogOut, LogIn } from 'lucide-react';
import { useAuth } from './AuthContext';

const Navbar = ({ currentPage, setCurrentPage, onLoginClick }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Leaf className="text-green-600" size={32} />
            <span className="text-xl font-bold text-gray-800">VaayuTrace</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('calculate')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'calculate' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Zap size={20} className="inline mr-2" />
              Calculate
            </button>
            <button
              onClick={() => setCurrentPage('history')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'history' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History size={20} className="inline mr-2" />
              History
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3 border-l pl-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-l pl-4">
                <button
                  onClick={onLoginClick}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all flex items-center gap-2 font-medium"
                >
                  <LogIn size={18} />
                  Login / Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;