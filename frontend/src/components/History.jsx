import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { History as HistoryIcon, Activity } from 'lucide-react';
import axios from 'axios';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => { 
    try {
      const response = await axios.get('http://localhost:5000/api/history', {
        withCredentials: true
      });
      console.log('History response:', response.data);
      
      // Your backend returns array directly, not wrapped in {history: [...]}
      const historyData = Array.isArray(response.data) ? response.data : response.data.history || [];
      
      // Sort by date (newest first)
      const sortedHistory = historyData.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.createdAt || a.date || 0);
        const dateB = new Date(b.timestamp || b.createdAt || b.date || 0);
        return dateB - dateA; // Descending order (newest first)
      });
      
      setHistory(sortedHistory);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date safely
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Helper function to format date and time safely
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const formatChartData = () => {
    // Use the last 10 entries (already sorted newest first, so reverse for chronological chart)
    const last10 = history.slice(0, 10).reverse();
    return last10.map((item, index) => ({
      name: `${index + 1}`,
      current: item.result,
      predicted: item.predictions?.ensemble || 0,
      date: formatDate(item.timestamp || item.createdAt || item.date)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <HistoryIcon className="text-blue-600" size={32} />
          Your Carbon Footprint History
        </h2>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600 text-lg">No history yet. Start by making predictions!</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Emissions Trend (Last 10 Entries)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" label={{ value: 'Entry', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                            <p className="text-sm text-gray-600 mb-1">{payload[0].payload.date}</p>
                            <p className="text-sm font-semibold text-red-600">
                              Current: {payload[0].value.toFixed(2)} kg CO₂
                            </p>
                            {payload[1] && (
                              <p className="text-sm font-semibold text-green-600">
                                Predicted: {payload[1].value.toFixed(2)} kg CO₂
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="current" stroke="#ef4444" name="Current" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="predicted" stroke="#10b981" name="Predicted" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Recent Calculations</h3>
              {history.map((item, index) => (
                <div key={item._id || index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-lg font-semibold text-gray-800 capitalize">{item.category}</span>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(item.timestamp || item.createdAt || item.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{item.result.toFixed(2)} kg CO₂</p>
                      <p className="text-sm text-gray-600">Current</p>
                    </div>
                  </div>
                  
                  {item.predictions && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-600">Linear</p>
                        <p className="text-sm font-semibold">{item.predictions.linear?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-600">Random Forest</p>
                        <p className="text-sm font-semibold">{item.predictions.random_forest?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-600">XGBoost</p>
                        <p className="text-sm font-semibold">{item.predictions.xgboost?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-600">Neural Net</p>
                        <p className="text-sm font-semibold">{item.predictions.neural?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-600">Ensemble</p>
                        <p className="text-sm font-semibold text-green-600">{item.predictions.ensemble?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                  
                  {item.suggestion && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Suggestion: </span>
                        {item.suggestion}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default History;