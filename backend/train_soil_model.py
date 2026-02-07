"""
Soil Classification Model Training Script
==========================================
This script trains a Random Forest Classifier to predict soil type
based on NPK values and environmental conditions.

Dataset: synthetic_soil_dataset.csv (1,000 records)
Features: N, P, K, temperature, humidity, ph, rainfall
Target: soil_type (Loamy, Clayey, Sandy, Silty)

Part of the Hybrid ML + Rule-Based AgriSoil AI System
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder
import joblib
import os
import json

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "ml_model", "datasets", "soil_classification", "synthetic_soil_dataset.csv")
MODEL_DIR = os.path.join(BASE_DIR, "app", "ml_models")
MODEL_PATH = os.path.join(MODEL_DIR, "soil_classification_model.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "soil_model_metadata.json")


def train_soil_classifier():
    """
    Train a soil classification model using the synthetic soil dataset.
    """
    print("=" * 60)
    print("🌱 SOIL CLASSIFICATION MODEL TRAINING")
    print("=" * 60)
    
    # Check if dataset exists
    if not os.path.exists(DATA_PATH):
        print(f"❌ Error: Dataset not found at {DATA_PATH}")
        return False
    
    print(f"\n📂 Loading dataset from: {DATA_PATH}")
    
    # Load dataset
    df = pd.read_csv(DATA_PATH)
    
    print(f"✅ Loaded {len(df)} records")
    print(f"\n📊 Dataset Overview:")
    print(f"   - Total samples: {len(df)}")
    print(f"   - Features: {list(df.columns[:-1])}")
    print(f"   - Target: {df.columns[-1]}")
    
    # Define features and target
    feature_columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    target_column = 'soil_type'
    
    # Verify all columns exist
    missing_features = [col for col in feature_columns if col not in df.columns]
    if missing_features:
        print(f"❌ Error: Missing feature columns: {missing_features}")
        return False
    
    if target_column not in df.columns:
        print(f"❌ Error: Target column '{target_column}' not found")
        return False
    
    # Prepare features and target
    X = df[feature_columns]
    y = df[target_column]
    
    # Analyze class distribution
    print(f"\n📈 Soil Type Distribution:")
    class_counts = y.value_counts()
    for soil_type, count in class_counts.items():
        percentage = (count / len(df)) * 100
        print(f"   - {soil_type}: {count} samples ({percentage:.1f}%)")
    
    # Get unique classes
    soil_types = sorted(y.unique().tolist())
    print(f"\n🏷️  Soil Types to Classify: {soil_types}")
    
    # Split data (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\n📊 Data Split:")
    print(f"   - Training set: {len(X_train)} samples")
    print(f"   - Test set: {len(X_test)} samples")
    
    # Train Random Forest Classifier
    print(f"\n🔧 Training Random Forest Classifier...")
    print(f"   - n_estimators: 100")
    print(f"   - max_depth: None (unlimited)")
    print(f"   - random_state: 42")
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1  # Use all CPU cores
    )
    
    model.fit(X_train, y_train)
    print("✅ Training complete!")
    
    # Evaluate on test set
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n📊 Model Performance:")
    print(f"   - Test Accuracy: {accuracy * 100:.2f}%")
    
    # Cross-validation score
    print(f"\n🔄 Cross-Validation (5-fold)...")
    cv_scores = cross_val_score(model, X, y, cv=5)
    print(f"   - Mean CV Accuracy: {cv_scores.mean() * 100:.2f}%")
    print(f"   - Std Deviation: {cv_scores.std() * 100:.2f}%")
    
    # Detailed classification report
    print(f"\n📋 Classification Report:")
    print("-" * 60)
    report = classification_report(y_test, y_pred)
    print(report)
    
    # Feature importance
    print(f"\n🎯 Feature Importance:")
    importance = model.feature_importances_
    feature_importance = sorted(zip(feature_columns, importance), key=lambda x: x[1], reverse=True)
    for feature, imp in feature_importance:
        bar = "█" * int(imp * 50)
        print(f"   {feature:12} : {imp:.4f} {bar}")
    
    # Save the model
    print(f"\n💾 Saving model...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"   ✅ Model saved to: {MODEL_PATH}")
    
    # Save metadata
    metadata = {
        "model_type": "RandomForestClassifier",
        "n_estimators": 100,
        "features": feature_columns,
        "target": target_column,
        "classes": soil_types,
        "n_classes": len(soil_types),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "test_accuracy": float(accuracy),
        "cv_mean_accuracy": float(cv_scores.mean()),
        "cv_std": float(cv_scores.std()),
        "feature_importance": {f: float(i) for f, i in zip(feature_columns, importance)},
        "class_distribution": {str(k): int(v) for k, v in class_counts.items()}
    }
    
    with open(METADATA_PATH, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"   ✅ Metadata saved to: {METADATA_PATH}")
    
    # Quick test
    print(f"\n🧪 Quick Test Prediction:")
    sample = X_test.iloc[0:3]
    predictions = model.predict(sample)
    probabilities = model.predict_proba(sample)
    
    for i, (pred, probs) in enumerate(zip(predictions, probabilities)):
        max_prob = max(probs) * 100
        print(f"   Sample {i+1}: Predicted '{pred}' with {max_prob:.1f}% confidence")
    
    print("\n" + "=" * 60)
    print("🎉 SOIL CLASSIFICATION MODEL TRAINING COMPLETE!")
    print("=" * 60)
    
    return True


def test_model():
    """
    Test the trained model with sample inputs.
    """
    print("\n🔬 Testing Soil Classification Model...")
    
    if not os.path.exists(MODEL_PATH):
        print("❌ Model not found! Please train first.")
        return
    
    model = joblib.load(MODEL_PATH)
    
    # Test samples representing different soil types
    test_samples = [
        # Typical Loamy soil (balanced NPK, moderate conditions)
        {"N": 60, "P": 45, "K": 55, "temperature": 25, "humidity": 70, "ph": 6.8, "rainfall": 600},
        # Typical Clayey soil (high NPK, high humidity)
        {"N": 85, "P": 65, "K": 90, "temperature": 24, "humidity": 82, "ph": 7.2, "rainfall": 950},
        # Typical Sandy soil (lower NPK, lower humidity)
        {"N": 35, "P": 35, "K": 40, "temperature": 28, "humidity": 55, "ph": 6.2, "rainfall": 400},
    ]
    
    feature_columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    
    for i, sample in enumerate(test_samples, 1):
        X = pd.DataFrame([sample])[feature_columns]
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        classes = model.classes_
        
        print(f"\n   Test Sample {i}:")
        print(f"   Input: N={sample['N']}, P={sample['P']}, K={sample['K']}, pH={sample['ph']}")
        print(f"   Predicted Soil Type: {prediction}")
        print(f"   Confidence Scores:")
        for cls, prob in sorted(zip(classes, probabilities), key=lambda x: x[1], reverse=True):
            bar = "█" * int(prob * 30)
            print(f"      {cls:8}: {prob*100:5.1f}% {bar}")


if __name__ == "__main__":
    success = train_soil_classifier()
    if success:
        test_model()
