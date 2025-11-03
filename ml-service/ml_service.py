"""
ML Prediction Microservice for Carbon Footprint Forecasting
Single Domain Predictions - One sector at a time
Compatible with TensorFlow 2.16+ and Python 3.10-3.12
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import xgboost as xgb
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
import joblib
import os

app = Flask(__name__)
CORS(app)

# Global variables - one model set per domain
models = {
    'electricity': {},
    'transport': {},
    'manufacturing': {},
    'construction': {},
    'agriculture': {}
}
scalers = {}

def generate_training_data_for_domain(domain, n_samples=5000):
    """Generate synthetic training data for a specific domain"""
    np.random.seed(42)
    
    # Domain-specific emission factors
    EMISSION_FACTORS = {
        'electricity': 0.92,      # kg CO₂ per kWh
        'transport': 0.411,       # kg CO₂ per mile
        'manufacturing': 50,      # kg CO₂ per unit
        'construction': 100,      # kg CO₂ per ton
        'agriculture': 200        # kg CO₂ per ton
    }
    
    # Domain-specific input ranges
    INPUT_RANGES = {
        'electricity': (0, 2000),     # kWh
        'transport': (0, 1000),       # miles
        'manufacturing': (0, 200),    # units
        'construction': (0, 100),     # tons
        'agriculture': (0, 60)        # tons
    }
    
    min_val, max_val = INPUT_RANGES[domain]
    input_values = np.random.uniform(min_val, max_val, n_samples)
    
    df = pd.DataFrame({
        'input': input_values
    })
    
    # Calculate current footprint
    current = df['input'] * EMISSION_FACTORS[domain]
    
    # Simulate future footprint (with trends and noise)
    growth_factor = np.random.uniform(1.05, 1.20, n_samples)  # 5-20% increase
    improvements = np.random.uniform(0, current * 0.15, n_samples)  # 0-15% reduction
    noise = np.random.normal(0, current * 0.05, n_samples)  # 5% std noise
    
    df['future_footprint'] = current * growth_factor - improvements + noise
    df['future_footprint'] = np.maximum(df['future_footprint'], 0)
    
    return df

def train_models_for_domain(domain):
    """Train all 4 models for a specific domain"""
    print(f"\nTraining models for {domain.upper()}...")
    
    # Generate data
    df = generate_training_data_for_domain(domain)
    
    X = df[['input']]
    y = df['future_footprint']
    
    # Split data
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Linear Regression
    print(f"  - Linear Regression...")
    linear_model = LinearRegression()
    linear_model.fit(X_train_scaled, y_train)
    
    # Train Random Forest
    print(f"  - Random Forest...")
    rf_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train_scaled, y_train)
    
    # Train XGBoost
    print(f"  - XGBoost...")
    xgb_model = xgb.XGBRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=6,
        random_state=42
    )
    xgb_model.fit(X_train_scaled, y_train)
    
    # Train Neural Network
    print(f"  - Neural Network...")
    nn_model = Sequential([
        Dense(32, activation='relu', input_shape=(1,)),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dropout(0.2),
        Dense(8, activation='relu'),
        Dense(1)
    ])
    
    nn_model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    nn_model.fit(
        X_train_scaled, y_train,
        validation_data=(X_val_scaled, y_val),
        epochs=50,
        batch_size=32,
        verbose=0
    )
    
    # Store models and scaler
    models[domain] = {
        'linear': linear_model,
        'random_forest': rf_model,
        'xgboost': xgb_model,
        'neural': nn_model
    }
    scalers[domain] = scaler
    
    # Print test scores
    print(f"  Test Scores for {domain.upper()}:")
    for name, model in models[domain].items():
        if name == 'neural':
            predictions = model.predict(X_test_scaled, verbose=0).flatten()
        else:
            predictions = model.predict(X_test_scaled)
        
        mae = np.mean(np.abs(predictions - y_test))
        print(f"    {name.upper()} - MAE: {mae:.2f} kg CO₂")

def initialize_all_models():
    """Train models for all domains"""
    domains = ['electricity', 'transport', 'manufacturing', 'construction', 'agriculture']
    
    print("="*60)
    print("Training ML Models for All Domains")
    print("="*60)
    
    for domain in domains:
        train_models_for_domain(domain)
    
    # Save models
    save_all_models()
    print("\n" + "="*60)
    print("✅ All models trained and saved successfully!")
    print("="*60)

def save_all_models():
    """Save all trained models"""
    os.makedirs('saved_models', exist_ok=True)
    
    for domain in models.keys():
        domain_dir = f'saved_models/{domain}'
        os.makedirs(domain_dir, exist_ok=True)
        
        joblib.dump(models[domain]['linear'], f'{domain_dir}/linear.pkl')
        joblib.dump(models[domain]['random_forest'], f'{domain_dir}/random_forest.pkl')
        joblib.dump(models[domain]['xgboost'], f'{domain_dir}/xgboost.pkl')
        models[domain]['neural'].save(f'{domain_dir}/neural.h5')
        joblib.dump(scalers[domain], f'{domain_dir}/scaler.pkl')

def load_all_models():
    """Load pre-trained models"""
    try:
        domains = ['electricity', 'transport', 'manufacturing', 'construction', 'agriculture']
        
        for domain in domains:
            domain_dir = f'saved_models/{domain}'
            
            models[domain] = {
                'linear': joblib.load(f'{domain_dir}/linear.pkl'),
                'random_forest': joblib.load(f'{domain_dir}/random_forest.pkl'),
                'xgboost': joblib.load(f'{domain_dir}/xgboost.pkl'),
                'neural': tf.keras.models.load_model(f'{domain_dir}/neural.h5')
            }
            scalers[domain] = joblib.load(f'{domain_dir}/scaler.pkl')
        
        print("✅ All models loaded successfully!")
        return True
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    models_loaded = all(
        domain in models and len(models[domain]) == 4 
        for domain in ['electricity', 'transport', 'manufacturing', 'construction', 'agriculture']
    )
    
    return jsonify({
        "status": "healthy",
        "models_loaded": models_loaded,
        "domains": list(models.keys())
    })

@app.route('/predict/<domain>', methods=['POST'])
def predict_domain(domain):
    """
    Predict future carbon footprint for a specific domain
    
    Examples:
    POST /predict/electricity
    {
        "input": 500  // kWh
    }
    
    POST /predict/transport
    {
        "input": 200  // miles
    }
    """
    try:
        # Validate domain
        valid_domains = ['electricity', 'transport', 'manufacturing', 'construction', 'agriculture']
        if domain not in valid_domains:
            return jsonify({
                "error": f"Invalid domain. Must be one of: {valid_domains}"
            }), 400
        
        data = request.json
        
        if 'input' not in data:
            return jsonify({
                "error": "Missing 'input' field in request body"
            }), 400
        
        input_value = float(data['input'])
        
        # Emission factors for current footprint calculation
        EMISSION_FACTORS = {
            'electricity': 0.92,
            'transport': 0.411,
            'manufacturing': 50,
            'construction': 100,
            'agriculture': 200
        }
        
        # Calculate current footprint
        current_footprint = input_value * EMISSION_FACTORS[domain]
        
        # Prepare input for models
        input_array = np.array([[input_value]])
        input_scaled = scalers[domain].transform(input_array)
        
        # Get predictions from all 4 models
        predictions = {}
        predictions['linear'] = float(models[domain]['linear'].predict(input_scaled)[0])
        predictions['random_forest'] = float(models[domain]['random_forest'].predict(input_scaled)[0])
        predictions['xgboost'] = float(models[domain]['xgboost'].predict(input_scaled)[0])
        predictions['neural'] = float(models[domain]['neural'].predict(input_scaled, verbose=0)[0][0])
        
        # Calculate ensemble
        ensemble_prediction = np.mean(list(predictions.values()))
        
        # Calculate percentage changes
        comparison = {}
        for model_name, pred_value in predictions.items():
            if current_footprint > 0:
                change = ((pred_value - current_footprint) / current_footprint) * 100
            else:
                change = 0
            comparison[f'{model_name}_change'] = round(change, 2)
        
        return jsonify({
            "success": True,
            "domain": domain,
            "input": input_value,
            "current_footprint": round(current_footprint, 2),
            "predictions": {
                "linear": round(predictions['linear'], 2),
                "random_forest": round(predictions['random_forest'], 2),
                "xgboost": round(predictions['xgboost'], 2),
                "neural": round(predictions['neural'], 2),
                "ensemble": round(ensemble_prediction, 2)
            },
            "comparison": comparison,
            "unit": "kg CO₂"
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route('/retrain', methods=['POST'])
def retrain_models():
    """Retrain all models"""
    try:
        initialize_all_models()
        return jsonify({
            "success": True,
            "message": "All models retrained successfully"
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route('/retrain/<domain>', methods=['POST'])
def retrain_domain(domain):
    """Retrain models for a specific domain"""
    try:
        valid_domains = ['electricity', 'transport', 'manufacturing', 'construction', 'agriculture']
        if domain not in valid_domains:
            return jsonify({
                "error": f"Invalid domain. Must be one of: {valid_domains}"
            }), 400
        
        train_models_for_domain(domain)
        
        # Save the retrained models
        domain_dir = f'saved_models/{domain}'
        os.makedirs(domain_dir, exist_ok=True)
        joblib.dump(models[domain]['linear'], f'{domain_dir}/linear.pkl')
        joblib.dump(models[domain]['random_forest'], f'{domain_dir}/random_forest.pkl')
        joblib.dump(models[domain]['xgboost'], f'{domain_dir}/xgboost.pkl')
        models[domain]['neural'].save(f'{domain_dir}/neural.h5')
        joblib.dump(scalers[domain], f'{domain_dir}/scaler.pkl')
        
        return jsonify({
            "success": True,
            "message": f"Models for {domain} retrained successfully"
        })
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

if __name__ == '__main__':
    import sys
    
    print("\n" + "="*60)
    print("🚀 Starting Carbon Footprint ML Service")
    print("="*60)
    
    # Try to load existing models
    print("\n📦 Checking for existing models...")
    if not load_all_models():
        print("\n⚠️  No saved models found!")
        print("🔧 Training new models (this will take 10-15 minutes)...")
        print("="*60)
        
        try:
            # Train all models
            initialize_all_models()
            print("\n✅ Model training completed successfully!")
        except Exception as e:
            print(f"\n❌ Error during model training: {e}")
            print("Attempting to continue with partial models...")
    else:
        print("✅ All models loaded successfully!")
    
    # Verify models are loaded
    models_count = sum(len(models[domain]) for domain in models.keys())
    print(f"\n📊 Total models loaded: {models_count}/20")
    
    # Get port from environment
    port = int(os.environ.get('PORT', 5001))
    
    print("\n" + "="*60)
    print("🌱 ML Service Ready!")
    print(f"🌐 Running on port {port}")
    print("="*60 + "\n")
    
    # Start the app
    app.run(host='0.0.0.0', port=port, debug=False)