## Updated History.jsx (Sorted by Newest First)

```jsx
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
    // Take last 10 entries and reverse for chronological chart display
    return history.slice(0, 10).reverse().map((item, index) => ({
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
```

---

## README.md

```markdown
# 🌍 Carbon Footprint Tracker

A comprehensive web application for tracking and predicting carbon emissions across multiple domains using machine learning models.

![Carbon Footprint Tracker](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Machine Learning Models](#machine-learning-models)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔐 User Authentication
- **Secure login/registration** with JWT tokens
- **Cookie-based authentication** for persistent sessions
- **Protected routes** for authenticated users

### 📊 Carbon Footprint Prediction
- **Multi-domain predictions** across 5 categories:
  - ⚡ Electricity
  - 🚗 Transport
  - 🏭 Manufacturing
  - 🏗️ Construction
  - 🌾 Agriculture
- **Multiple ML models** for accurate predictions:
  - Linear Regression
  - Random Forest
  - XGBoost
  - Neural Network
  - Ensemble (weighted average)

### 📈 Analytics & History
- **Interactive charts** showing emission trends
- **Detailed history** of all calculations
- **Personalized suggestions** based on emission levels
- **Comparison** between current and predicted values

### 🎨 User Interface
- **Modern, responsive design** with Tailwind CSS
- **Gradient backgrounds** and smooth animations
- **Real-time feedback** and loading states
- **Error handling** with user-friendly messages

## 🛠️ Tech Stack

### Frontend
- **React** 18+ - UI framework
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Tailwind CSS** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Cookie-parser** - Cookie handling
- **Bcrypt** - Password hashing

### Machine Learning
- **Python** - ML models
- **scikit-learn** - ML library
- **XGBoost** - Gradient boosting
- **TensorFlow/Keras** - Neural networks
- **pandas** - Data manipulation
- **numpy** - Numerical computing

## 📦 Prerequisites

- **Node.js** >= 14.x
- **Python** >= 3.8
- **MongoDB** >= 4.x
- **npm** or **yarn**

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/carbon-footprint-tracker.git
cd carbon-footprint-tracker
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Install Python Dependencies
```bash
cd ../ml-models
pip install -r requirements.txt
```

## 🔑 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/carbon-footprint

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Cookie Configuration
COOKIE_EXPIRE=7

# CORS
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## ▶️ Running the Application

### 1. Start MongoDB
```bash
# Using MongoDB service
sudo service mongodb start

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Start Frontend Development Server
```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3000`

### 4. Start Python ML Service (if separate)
```bash
cd ml-models
python app.py
```

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
POST   /api/auth/logout      - Logout user
GET    /api/auth/verify      - Verify authentication status
```

### Predictions
```
POST   /api/predict          - Make carbon footprint prediction
GET    /api/history          - Get user's prediction history
```

## 📁 Project Structure

```
carbon-footprint-tracker/
│
├── backend/
│   ├── config/
│   │   └── config.js           # Configuration settings
│   ├── controllers/
│   │   ├── auth.controller.js  # Authentication logic
│   │   └── predict.controller.js
│   ├── dao/
│   │   └── user.dao.js         # Database operations
│   ├── middleware/
│   │   └── auth.middleware.js  # JWT protection
│   ├── models/
│   │   ├── User.js
│   │   └── Prediction.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── predict.routes.js
│   ├── services/
│   │   └── auth.service.js
│   ├── utils/
│   │   └── suggestions.js
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── SingleDomainPredictor.jsx
│   │   │   └── History.jsx
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
│
├── ml-models/
│   ├── models/
│   ├── train.py
│   └── requirements.txt
│
└── README.md
```

## 🤖 Machine Learning Models

### 1. Linear Regression
Simple baseline model for quick predictions.

### 2. Random Forest
Ensemble method using multiple decision trees.

### 3. XGBoost
Gradient boosting for high accuracy.

### 4. Neural Network
Deep learning model for complex patterns.

### 5. Ensemble
Weighted average of all models for best accuracy:
- Linear: 10%
- Random Forest: 25%
- XGBoost: 35%
- Neural: 30%

## 🎯 Usage Example

1. **Register/Login** to access full features
2. **Select a domain** (Electricity, Transport, etc.)
3. **Enter required data** (consumption, distance, etc.)
4. **Get predictions** from multiple ML models
5. **View suggestions** tailored to your emission level
6. **Track history** and see trends over time

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - [Your GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Carbon emission calculation formulas
- Machine learning community
- Open source contributors

## 📧 Contact

For questions or support, please contact:
- Email: your.email@example.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/carbon-footprint-tracker/issues)

---

**Made with ❤️ for a sustainable future 🌱**
```

---

## Additional Files You Might Want

### LICENSE (MIT License)
```
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### .gitignore
```
# Dependencies
node_modules/
__pycache__/
*.pyc

# Environment variables
.env
.env.local

# Build files
/frontend/build
/backend/dist

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Python
*.py[cod]
*$py.class
.Python
venv/
env/
