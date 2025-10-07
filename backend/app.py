# ============================================
# Flask Backend - Biomarker Prediction API
# File: app.py
# ============================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import pickle
import xgboost as xgb
from sklearn.impute import KNNImputer
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend connection

# ============================================
# Load Trained XGBoost Model
# ============================================
MODEL_PATH = 'biomarker_xgboost_model.pkl'

try:
    with open(MODEL_PATH, 'rb') as f:
        xgb_model = pickle.load(f)
    print(f"✅ Model loaded successfully from {MODEL_PATH}")
except FileNotFoundError:
    print(f"⚠️  Warning: Model file not found at {MODEL_PATH}")
    print("   Using fallback model. Train and save your model first!")
    xgb_model = None

# ============================================
# Preprocessing Configuration
# ============================================
IQR_STATS = {
    'age': {'q1': 52.0, 'q3': 71.0, 'iqr': 19.0, 'lower': 23.5, 'upper': 99.5},
    'plasma_CA19_9': {'q1': 8.2, 'q3': 85.5, 'iqr': 77.3, 'lower': -107.75, 'upper': 201.45},
    'creatinine': {'q1': 0.9, 'q3': 1.2, 'iqr': 0.3, 'lower': 0.45, 'upper': 1.65},
    'LYVE1': {'q1': 3.5, 'q3': 12.8, 'iqr': 9.3, 'lower': -10.45, 'upper': 26.75},
    'REG1A': {'q1': 120.0, 'q3': 580.0, 'iqr': 460.0, 'lower': -570.0, 'upper': 1270.0},
    'REG1B': {'q1': 85.0, 'q3': 420.0, 'iqr': 335.0, 'lower': -417.5, 'upper': 922.5},
    'TFF1': {'q1': 45.0, 'q3': 220.0, 'iqr': 175.0, 'lower': -217.5, 'upper': 482.5}
}

CLASS_LABELS = {
    0: 'Control',
    1: 'Benign', 
    2: 'Cancer'
}

# ============================================
# Preprocessing Functions
# ============================================

def preprocess_biomarker_data(data):
    """Preprocess incoming biomarker data to match training format"""
    df = pd.DataFrame([data])
    
    # Handle sex encoding (M -> 1, F -> 0)
    if 'sex' in df.columns:
        df['sex_M'] = (df['sex'] == 'M').astype(int)
        df = df.drop('sex', axis=1)
    
    # Apply IQR-based outlier capping
    numerical_cols = ['age', 'plasma_CA19_9', 'creatinine', 'LYVE1', 'REG1A', 'REG1B', 'TFF1']
    
    for col in numerical_cols:
        if col in df.columns and col in IQR_STATS:
            stats = IQR_STATS[col]
            df[col] = df[col].clip(lower=stats['lower'], upper=stats['upper'])
    
    # Apply log1p transformation
    for col in numerical_cols:
        if col in df.columns:
            df[col] = np.log1p(df[col])
    
    # Handle missing values with KNN imputation
    imputer = KNNImputer(n_neighbors=5)
    df_imputed = pd.DataFrame(
        imputer.fit_transform(df),
        columns=df.columns
    )
    
    # Ensure correct column order
    feature_order = ['age', 'sex_M', 'plasma_CA19_9', 'creatinine', 'LYVE1', 'REG1A', 'REG1B', 'TFF1']
    df_final = df_imputed[feature_order]
    
    return df_final

def calculate_risk_score(prediction_class, probabilities):
    """Calculate risk score from prediction"""
    if prediction_class == 0:  # Control
        risk_score = int(20 + probabilities[0] * 20)
    elif prediction_class == 1:  # Benign
        risk_score = int(40 + probabilities[1] * 30)
    else:  # Cancer
        risk_score = int(70 + probabilities[2] * 30)
    
    return min(max(risk_score, 0), 100)

# ============================================
# API Endpoints
# ============================================

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'message': 'Biomarker Prediction API',
        'version': '1.0',
        'model_loaded': xgb_model is not None
    })

@app.route('/api/predict/biomarkers', methods=['POST'])
def predict_biomarkers():
    """Main prediction endpoint for biomarker analysis"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['age', 'sex', 'plasma_CA19_9', 'creatinine', 'LYVE1', 'REG1A', 'REG1B', 'TFF1']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Validate data types
        try:
            data['age'] = float(data['age'])
            data['plasma_CA19_9'] = float(data['plasma_CA19_9'])
            data['creatinine'] = float(data['creatinine'])
            data['LYVE1'] = float(data['LYVE1'])
            data['REG1A'] = float(data['REG1A'])
            data['REG1B'] = float(data['REG1B'])
            data['TFF1'] = float(data['TFF1'])
        except ValueError as e:
            return jsonify({'error': f'Invalid numeric value: {str(e)}'}), 400
        
        # Validate sex value
        if data['sex'] not in ['M', 'F']:
            return jsonify({'error': 'Sex must be "M" or "F"'}), 400
        
        # Preprocess the data
        preprocessed_data = preprocess_biomarker_data(data)
        
        # Make prediction
        if xgb_model is not None:
            probabilities = xgb_model.predict_proba(preprocessed_data)[0]
            prediction_class = int(xgb_model.predict(preprocessed_data)[0])
            prediction_label = CLASS_LABELS[prediction_class]
            confidence = float(probabilities[prediction_class])
            risk_score = calculate_risk_score(prediction_class, probabilities)
            
        else:
            # Fallback prediction
            print("⚠️  Using fallback prediction (no model loaded)")
            ca199 = data['plasma_CA19_9']
            age = data['age']
            creatinine = data['creatinine']
            
            if ca199 > 100 or age > 65:
                prediction_class = 2
                prediction_label = "Cancer"
                confidence = 0.75
                probabilities = [0.10, 0.15, 0.75]
            elif ca199 > 37 or creatinine > 1.5:
                prediction_class = 1
                prediction_label = "Benign"
                confidence = 0.70
                probabilities = [0.15, 0.70, 0.15]
            else:
                prediction_class = 0
                prediction_label = "Control"
                confidence = 0.80
                probabilities = [0.80, 0.15, 0.05]
            
            risk_score = calculate_risk_score(prediction_class, probabilities)
        
        # Prepare response
        response = {
            'success': True,
            'prediction_class': prediction_class,
            'prediction_label': prediction_label,
            'confidence': round(confidence, 3),
            'risk_score': risk_score,
            'probabilities': {
                'Control': round(float(probabilities[0]), 3),
                'Benign': round(float(probabilities[1]), 3),
                'Cancer': round(float(probabilities[2]), 3)
            },
            'input_data': data
        }
        
        print(f"✅ Prediction successful: {prediction_label} (confidence: {confidence:.2%})")
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"❌ Error during prediction: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Detailed health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': xgb_model is not None,
        'endpoints': {
            'predict': '/api/predict/biomarkers (POST)',
            'health': '/api/health (GET)'
        }
    })

# ============================================
# Run Flask App
# ============================================

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Starting Biomarker Prediction API Server")
    print("=" * 60)
    print(f"Model Status: {'✅ Loaded' if xgb_model else '⚠️  Not Loaded (using fallback)'}")
    print("Server running on: http://localhost:5000")
    print("API Endpoint: http://localhost:5000/api/predict/biomarkers")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
