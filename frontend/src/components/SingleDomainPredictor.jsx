import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, TrendingUp, Leaf, Activity, AlertCircle, CheckCircle, LogIn } from 'lucide-react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const SingleDomainPredictor = () => {
    const { isAuthenticated } = useAuth();
    const [selectedDomain, setSelectedDomain] = useState('electricity');
    const [inputValue, setInputValue] = useState('');
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const domains = {
        electricity: {
            label: 'Electricity',
            inputLabel: 'Energy Consumed (kWh)',
            placeholder: '500',
            icon: <Zap className="text-yellow-500" size={24} />,
            color: '#eab308'
        },
        transport: {
            label: 'Transport',
            inputLabel: 'Miles Driven',
            placeholder: '200',
            icon: <Activity className="text-blue-500" size={24} />,
            color: '#3b82f6'
        },
        manufacturing: {
            label: 'Manufacturing',
            inputLabel: 'Products Produced (units)',
            placeholder: '50',
            icon: <TrendingUp className="text-purple-500" size={24} />,
            color: '#a855f7'
        },
        construction: {
            label: 'Construction',
            inputLabel: 'Materials Used (tons)',
            placeholder: '20',
            icon: <TrendingUp className="text-orange-500" size={24} />,
            color: '#f97316'
        },
        agriculture: {
            label: 'Agriculture',
            inputLabel: 'Crops Grown (tons)',
            placeholder: '10',
            icon: <Leaf className="text-green-500" size={24} />,
            color: '#22c55e'
        }
    };

    const handlePredict = async () => {
        if (!inputValue || parseFloat(inputValue) <= 0) {
            setError('Please enter a valid positive number');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Use calculate-auth if authenticated, calculate if not
            const endpoint = isAuthenticated ? 'calculate-auth' : 'calculate';
            
            const response = await axios.post(
                `http://localhost:5000/api/${selectedDomain}/${endpoint}`,
                {
                    energyConsumed: parseFloat(inputValue)
                }
            );

            setPredictions(response.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to get predictions');
            console.error('Prediction error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatChartData = () => {
        if (!predictions || !predictions.predictions) return [];

        return [
            { name: 'Current', value: predictions.result, fill: '#ef4444' },
            { name: 'Linear', value: predictions.predictions.linear, fill: '#3b82f6' },
            { name: 'Random Forest', value: predictions.predictions.random_forest, fill: '#10b981' },
            { name: 'XGBoost', value: predictions.predictions.xgboost, fill: '#f59e0b' },
            { name: 'Neural Network', value: predictions.predictions.neural, fill: '#8b5cf6' },
            { name: 'Ensemble', value: predictions.predictions.ensemble, fill: '#06b6d4' }
        ];
    };

    const getAverageChange = () => {
        if (!predictions || !predictions.comparison) return 0;
        const changes = Object.values(predictions.comparison);
        return (changes.reduce((a, b) => a + b, 0) / changes.length).toFixed(2);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
                    <Leaf className="text-green-600" size={40} />
                    VaayuTrace - Estimating carbon emissions in air
                </h1>
                <p className="text-gray-600">Select a domain and predict future emissions using 4 ML models</p>
                {!isAuthenticated && (
                    <div className="mt-4 inline-block bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                        <LogIn className="inline text-blue-600 mr-2" size={18} />
                        <span className="text-blue-700 text-sm">
                            Login to save your prediction history
                        </span>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Select Domain</h2>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {Object.entries(domains).map(([key, domain]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setSelectedDomain(key);
                                setInputValue('');
                                setPredictions(null);
                                setError(null);
                            }}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${selectedDomain === key
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex flex-col items-center gap-2">
                                {domain.icon}
                                <span className="font-semibold text-sm">{domain.label}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {domains[selectedDomain].inputLabel}
                        </label>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handlePredict()}
                            placeholder={domains[selectedDomain].placeholder}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        onClick={handlePredict}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Predicting...
                            </>
                        ) : (
                            <>
                                <Zap size={20} />
                                Get Calculations
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>

            {predictions && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Current Footprint</p>
                                    <p className="text-3xl font-bold text-gray-800">
                                        {predictions.result.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">kg CO₂</p>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-full">
                                    {domains[predictions.category || selectedDomain].icon}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Ensemble Prediction</p>
                                    <p className="text-3xl font-bold text-gray-800">
                                        {predictions.predictions.ensemble.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">kg CO₂ (avg of 4 models)</p>
                                </div>
                                <div className="bg-green-100 p-3 rounded-full">
                                    <TrendingUp className="text-green-600" size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Average Change</p>
                                    <p className={`text-3xl font-bold ${parseFloat(getAverageChange()) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {getAverageChange() > 0 ? '+' : ''}{getAverageChange()}%
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">projected change</p>
                                </div>
                                <div className={`${parseFloat(getAverageChange()) > 0 ? 'bg-red-100' : 'bg-green-100'} p-3 rounded-full`}>
                                    <TrendingUp className={`${parseFloat(getAverageChange()) > 0 ? 'text-red-600' : 'text-green-600'}`} size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {predictions.suggestion && (
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-lg p-6 mb-8 text-white">
                            <div className="flex items-start gap-3">
                                {/* <CheckCircle size={24} className="flex-shrink-0 mt-1" /> */}
                                <div>
                                    <h3 className="text-xl font-bold mb-2">💡 Suggestion</h3>
                                    <p className="text-lg">{predictions.suggestion}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Model Predictions Comparison</h2>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={formatChartData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }} />
                                <Tooltip
                                    formatter={(value) => [`${value.toFixed(2)} kg CO₂`, 'Emission']}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                                />
                                <Legend />
                                <Bar dataKey="value" name="Carbon Footprint (kg CO₂)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Activity size={24} />
                                Model Predictions
                            </h3>
                            <div className="space-y-4 text-gray-700">
                                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Linear Regression:</span>
                                        <span className="text-2xl font-bold">{predictions.predictions.linear.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs opacity-80 mt-1">Simple, fast, interpretable</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Random Forest:</span>
                                        <span className="text-2xl font-bold">{predictions.predictions.random_forest.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs opacity-80 mt-1">Robust ensemble method</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">XGBoost:</span>
                                        <span className="text-2xl font-bold">{predictions.predictions.xgboost.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs opacity-80 mt-1">High accuracy gradient boosting</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Neural Network:</span>
                                        <span className="text-2xl font-bold">{predictions.predictions.neural.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs opacity-80 mt-1">Deep learning pattern recognition</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-8 text-white">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <TrendingUp size={24} />
                                Percentage Changes
                            </h3>
                            <div className="space-y-4 text-gray-700">
                                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Linear:</span>
                                        <span className="text-2xl font-bold">
                                            {predictions.comparison.linear_change > 0 ? '+' : ''}{predictions.comparison.linear_change}%
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Random Forest:</span>
                                        <span className="text-2xl font-bold">
                                            {predictions.comparison.random_forest_change > 0 ? '+' : ''}{predictions.comparison.random_forest_change}%
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">XGBoost:</span>
                                        <span className="text-2xl font-bold">
                                            {predictions.comparison.xgboost_change > 0 ? '+' : ''}{predictions.comparison.xgboost_change}%
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Neural Network:</span>
                                        <span className="text-2xl font-bold">
                                            {predictions.comparison.neural_change > 0 ? '+' : ''}{predictions.comparison.neural_change}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <AlertCircle size={20} />
                            📊 Understanding the Results
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div className="bg-white rounded-lg p-4">
                                <p className="font-semibold mb-2 text-blue-600">Current Footprint ({predictions.result.toFixed(2)} kg CO₂)</p>
                                <p>Your current carbon emissions based on {predictions.category} input using standard emission factors.</p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <p className="font-semibold mb-2 text-green-600">Predictions</p>
                                <p>Future emissions predicted by 4 different ML models considering growth trends, improvements, and historical patterns.</p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <p className="font-semibold mb-2 text-purple-600">Ensemble ({predictions.predictions.ensemble.toFixed(2)} kg CO₂)</p>
                                <p>Average of all 4 models - usually the most reliable prediction as it balances different modeling approaches.</p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <p className="font-semibold mb-2 text-orange-600">Change % (Avg: {getAverageChange()}%)</p>
                                <p>Expected increase or decrease in emissions. Positive values indicate growth, negative values show reduction.</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SingleDomainPredictor;