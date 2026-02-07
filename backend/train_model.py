import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import os

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Path to the provided dataset
DATA_PATH = os.path.join(BASE_DIR, "..", "ml_model", "datasets", "combined", "unified_agricultural_dataset.csv")
# Output directory for the model
MODEL_DIR = os.path.join(BASE_DIR, "app", "ml_models")
MODEL_PATH = os.path.join(MODEL_DIR, "crop_recommendation_model.joblib")

def train():
    print(f"Loading dataset from: {DATA_PATH}")
    
    if not os.path.exists(DATA_PATH):
        print(f"Error: Dataset not found at {DATA_PATH}")
        return

    # Load dataset
    df = pd.read_csv(DATA_PATH)
    
    # Expected columns for input features
    # Note: Dataset has 'crop', 'soil_type', 'N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'
    # We will use the numeric features to predict 'crop'
    feature_columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    target_column = 'crop'
    
    if target_column not in df.columns:
         # Fallback to 'label' if 'crop' doesn't exist (Dataset headers might vary)
        if 'label' in df.columns:
            target_column = 'label'
        else:
            print(f"Error: Target column 'crop' or 'label' not found. Columns: {df.columns}")
            return

    # Verify features exist
    if not all(col in df.columns for col in feature_columns):
        print(f"Error: Missing feature columns. Expected: {feature_columns}")
        return

    # Prepare features and target
    X = df[feature_columns]
    y = df[target_column]
    
    print(f"Training on {len(df)} samples using features: {feature_columns}")
    print(f"Target classes: {y.nunique()} crops")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train model
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")

    # Save model
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to: {MODEL_PATH}")

if __name__ == "__main__":
    train()
