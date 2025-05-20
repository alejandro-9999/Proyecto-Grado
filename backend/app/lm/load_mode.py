from tensorflow.keras.models import load_model
import tensorflow as tf
import joblib
import os

def load_trained_model(path="app/lm/models"):
    """
    Load the trained LSTM model with custom objects to handle the 'mse' loss function issue.
    
    Args:
        path: Path to the directory containing model files
        
    Returns:
        model: The loaded LSTM model
        scaler_X: Scaler for input features
        scaler_y: Scaler for target values
        features_columns: Feature column names
    """
    # Define custom objects to resolve the 'mse' serialization issue
    custom_objects = {
        'mse': tf.keras.losses.MeanSquaredError(),
        'mean_squared_error': tf.keras.losses.MeanSquaredError()
    }
    
    # Load the model with custom objects
    model = load_model(os.path.join(path, "lstm_model.h5"), custom_objects=custom_objects)
    
    # Load the scalers and feature columns
    scaler_X = joblib.load(os.path.join(path, "scaler_X.pkl"))
    scaler_y = joblib.load(os.path.join(path, "scaler_y.pkl"))
    features_columns = joblib.load(os.path.join(path, "features_columns.pkl"))
    
    return model, scaler_X, scaler_y, features_columns