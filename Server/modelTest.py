import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import warnings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Suppress sklearn warnings
warnings.filterwarnings('ignore')

def load_model_and_features():
    """Load the model and feature names from files."""
    try:
        model_path = os.path.join(os.path.dirname(__file__), "heart_disease_rf_model (2).pkl")
        features_path = os.path.join(os.path.dirname(__file__), "feature_names (1).pkl")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}")
        if not os.path.exists(features_path):
            raise FileNotFoundError(f"Features file not found at: {features_path}")
            
        model = joblib.load(model_path)
        feature_names = joblib.load(features_path)
        
        return model, feature_names
    
    except Exception as e:
        logger.error(f"Error loading model or features: {str(e)}")
        raise

def validate_input(patient_data, required_features):
    """Validate input data against required features."""
    missing_features = set(required_features) - set(patient_data.keys())
    if missing_features:
        raise ValueError(f"Missing required features: {missing_features}")
    
    # Ensure all values are numeric
    for key, value in patient_data.items():
        if not isinstance(value, (int, float)):
            raise ValueError(f"Non-numeric value found for feature {key}: {value}")

def predict_heart_disease(patient_data):
    """Predict heart disease risk based on patient data."""
    try:
        # Validate input data
        validate_input(patient_data, loaded_feature_names)
        
        # Create DataFrame with correct feature order
        df = pd.DataFrame([patient_data], columns=loaded_feature_names)
        
        # Make prediction
        prediction = model.predict(df)[0]
        
        # Get probability of the predicted class
        # Fixed: Get probability of positive class (1) if prediction is 1, otherwise probability of negative class (0)
        probability = model.predict_proba(df)[0][1] if prediction == 1 else model.predict_proba(df)[0][0]
        
        # Extract risk factors
        risk_factors = {k: v for k, v in patient_data.items() 
                       if k in ['age', 'sex', 'chol', 'trestbps', 'thalach']}
        
        return {
            "prediction": "Heart Disease exists" if prediction == 1 else "No Heart Disease",
            "confidence": f"{probability*100:.1f}%",
            "risk_factors": risk_factors
        }
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return {
            "error": "Prediction failed",
            "message": str(e)
        }

# Load model and features at module level
try:
    model, loaded_feature_names = load_model_and_features()
    logger.info("Model and features loaded successfully")
except Exception as e:
    logger.error(f"Failed to initialize model: {str(e)}")
    model = None
    loaded_feature_names = None

if __name__ == "__main__":
    # Test case
    test_case = {
        'age': 52,
        'sex': 1,
        'cp': 0,
        'trestbps': 125,
        'chol': 212,
        'fbs': 0,
        'restecg': 1,
        'thalach': 168,
        'exang': 0,
        'oldpeak': 1.0,
        'slope': 1,
        'ca': 0,
        'thal': 2
    }
    
    print("\nTest Prediction:")
    if model is not None:
        result = predict_heart_disease(test_case)
        print(result)
    else:
        print("Model not properly initialized. Please check the error logs.")