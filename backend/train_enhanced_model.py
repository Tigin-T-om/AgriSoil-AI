"""
Enhanced Crop Recommendation Model Training
============================================
This script trains an improved crop recommendation model using:
1. Hyperparameter tuning with GridSearchCV
2. Feature engineering (nutrient ratios, environmental indices)
3. Ensemble methods (Random Forest with optimized parameters)
4. Cross-validation for robust accuracy estimation

Target: >85% accuracy
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
import json
import warnings
warnings.filterwarnings('ignore')

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "ml_model", "datasets", "combined", "unified_agricultural_dataset.csv")
MODEL_DIR = os.path.join(BASE_DIR, "app", "ml_models")
MODEL_PATH = os.path.join(MODEL_DIR, "crop_recommendation_model.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "crop_model_metadata.json")


def create_enhanced_features(df):
    """
    Create additional features to improve model accuracy.
    Feature engineering based on agricultural domain knowledge.
    """
    df = df.copy()
    
    # Nutrient ratios (important for crop selection)
    df['N_P_ratio'] = df['N'] / (df['P'] + 1)  # +1 to avoid division by zero
    df['N_K_ratio'] = df['N'] / (df['K'] + 1)
    df['P_K_ratio'] = df['P'] / (df['K'] + 1)
    
    # Total nutrients
    df['total_nutrients'] = df['N'] + df['P'] + df['K']
    
    # Nutrient balance score (closer to 1:1:1 = more balanced)
    nutrient_mean = df['total_nutrients'] / 3
    df['nutrient_balance'] = 1 - (
        abs(df['N'] - nutrient_mean) + 
        abs(df['P'] - nutrient_mean) + 
        abs(df['K'] - nutrient_mean)
    ) / (df['total_nutrients'] + 1)
    
    # Environmental stress index
    # Optimal ranges: temp 20-30, humidity 60-80, ph 6-7
    df['temp_stress'] = abs(df['temperature'] - 25) / 25
    df['humidity_stress'] = abs(df['humidity'] - 70) / 70
    df['ph_stress'] = abs(df['ph'] - 6.5) / 6.5
    df['env_stress_index'] = (df['temp_stress'] + df['humidity_stress'] + df['ph_stress']) / 3
    
    # Rainfall category
    df['rainfall_category'] = pd.cut(
        df['rainfall'],
        bins=[0, 50, 100, 150, 200, 300, 3000],
        labels=[0, 1, 2, 3, 4, 5]
    ).astype(int)
    
    # pH category
    df['ph_category'] = pd.cut(
        df['ph'],
        bins=[0, 5.5, 6.5, 7.5, 14],
        labels=[0, 1, 2, 3]
    ).astype(int)
    
    return df


def train_enhanced_model():
    """
    Train an enhanced crop recommendation model with improved accuracy.
    """
    print("=" * 70)
    print("🌾 ENHANCED CROP RECOMMENDATION MODEL TRAINING")
    print("=" * 70)
    
    # Check dataset
    if not os.path.exists(DATA_PATH):
        print(f"❌ Error: Dataset not found at {DATA_PATH}")
        return False
    
    print(f"\n📂 Loading dataset from: {DATA_PATH}")
    
    # Load data
    df = pd.read_csv(DATA_PATH)
    print(f"✅ Loaded {len(df)} samples")
    
    # Basic features
    base_features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    target_column = 'crop'
    
    # Verify columns
    if target_column not in df.columns:
        if 'label' in df.columns:
            target_column = 'label'
        else:
            print(f"❌ Error: Target column not found")
            return False
    
    print(f"\n📊 Dataset Overview:")
    print(f"   - Samples: {len(df)}")
    print(f"   - Crops: {df[target_column].nunique()}")
    print(f"   - Base features: {len(base_features)}")
    
    # Create enhanced features
    print("\n🔧 Creating enhanced features...")
    df_enhanced = create_enhanced_features(df)
    
    # Enhanced feature list
    enhanced_features = base_features + [
        'N_P_ratio', 'N_K_ratio', 'P_K_ratio',
        'total_nutrients', 'nutrient_balance',
        'temp_stress', 'humidity_stress', 'ph_stress', 'env_stress_index',
        'rainfall_category', 'ph_category'
    ]
    
    print(f"   - Total features: {len(enhanced_features)}")
    
    # Prepare data
    X = df_enhanced[enhanced_features]
    y = df_enhanced[target_column]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\n📊 Data Split:")
    print(f"   - Training: {len(X_train)} samples")
    print(f"   - Testing: {len(X_test)} samples")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # =========================================================================
    # APPROACH 1: Optimized Random Forest
    # =========================================================================
    print("\n" + "=" * 50)
    print("🌲 Training Optimized Random Forest...")
    print("=" * 50)
    
    # Define parameter grid for tuning
    param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 20, 30, None],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4]
    }
    
    # Quick grid search (subset for speed)
    quick_param_grid = {
        'n_estimators': [200, 300],
        'max_depth': [20, 30, None],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2]
    }
    
    print("   🔍 Running GridSearchCV for hyperparameter tuning...")
    
    rf_base = RandomForestClassifier(random_state=42, n_jobs=-1)
    grid_search = GridSearchCV(
        rf_base, 
        quick_param_grid, 
        cv=5, 
        scoring='accuracy',
        n_jobs=-1,
        verbose=0
    )
    grid_search.fit(X_train_scaled, y_train)
    
    best_params = grid_search.best_params_
    print(f"   ✅ Best parameters: {best_params}")
    print(f"   📊 Best CV Score: {grid_search.best_score_ * 100:.2f}%")
    
    # Train final model with best parameters
    print("\n   🎯 Training final model with best parameters...")
    
    rf_model = RandomForestClassifier(
        **best_params,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred_rf = rf_model.predict(X_test_scaled)
    rf_accuracy = accuracy_score(y_test, y_pred_rf)
    
    print(f"\n   📈 Random Forest Results:")
    print(f"      Test Accuracy: {rf_accuracy * 100:.2f}%")
    
    # Cross-validation
    cv_scores = cross_val_score(rf_model, X_train_scaled, y_train, cv=5)
    print(f"      CV Accuracy: {cv_scores.mean() * 100:.2f}% (±{cv_scores.std() * 100:.2f}%)")
    
    # =========================================================================
    # APPROACH 2: Gradient Boosting (if RF accuracy < 90%)
    # =========================================================================
    gb_accuracy = 0
    if rf_accuracy < 0.90:
        print("\n" + "=" * 50)
        print("🚀 Training Gradient Boosting for comparison...")
        print("=" * 50)
        
        gb_model = GradientBoostingClassifier(
            n_estimators=200,
            max_depth=10,
            learning_rate=0.1,
            random_state=42
        )
        gb_model.fit(X_train_scaled, y_train)
        
        y_pred_gb = gb_model.predict(X_test_scaled)
        gb_accuracy = accuracy_score(y_test, y_pred_gb)
        
        print(f"   📈 Gradient Boosting Accuracy: {gb_accuracy * 100:.2f}%")
    
    # Select best model
    if gb_accuracy > rf_accuracy:
        final_model = gb_model
        final_accuracy = gb_accuracy
        model_type = "GradientBoosting"
        print("\n   ✅ Selected: Gradient Boosting (higher accuracy)")
    else:
        final_model = rf_model
        final_accuracy = rf_accuracy
        model_type = "RandomForest"
        print("\n   ✅ Selected: Random Forest")
    
    # =========================================================================
    # Feature Importance
    # =========================================================================
    print("\n🎯 Feature Importance (Top 10):")
    if hasattr(final_model, 'feature_importances_'):
        importance = final_model.feature_importances_
        feature_importance = sorted(
            zip(enhanced_features, importance), 
            key=lambda x: x[1], 
            reverse=True
        )
        for i, (feature, imp) in enumerate(feature_importance[:10], 1):
            bar = "█" * int(imp * 50)
            print(f"   {i:2}. {feature:20}: {imp:.4f} {bar}")
    
    # =========================================================================
    # Final Evaluation
    # =========================================================================
    print("\n" + "=" * 70)
    print("📋 FINAL MODEL EVALUATION")
    print("=" * 70)
    
    print(f"\n   Model Type: {model_type}")
    print(f"   Test Accuracy: {final_accuracy * 100:.2f}%")
    print(f"   Total Features: {len(enhanced_features)}")
    print(f"   Training Samples: {len(X_train)}")
    
    # Detailed classification report
    print("\n📋 Classification Report (Sample):")
    report = classification_report(y_test, final_model.predict(X_test_scaled))
    # Print first 20 lines
    for line in report.split('\n')[:20]:
        print(f"   {line}")
    
    # =========================================================================
    # Save Model
    # =========================================================================
    print("\n💾 Saving model...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # Save as a package with scaler and feature list
    model_package = {
        'model': final_model,
        'scaler': scaler,
        'features': enhanced_features,
        'base_features': base_features
    }
    
    joblib.dump(model_package, MODEL_PATH)
    print(f"   ✅ Model saved to: {MODEL_PATH}")
    
    # Save metadata
    metadata = {
        "model_type": model_type,
        "accuracy": float(final_accuracy),
        "cv_accuracy": float(cv_scores.mean()) if model_type == "RandomForest" else None,
        "n_features": len(enhanced_features),
        "base_features": base_features,
        "enhanced_features": enhanced_features,
        "n_classes": int(y.nunique()),
        "classes": sorted(y.unique().tolist()),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "best_params": best_params if model_type == "RandomForest" else None,
        "feature_importance": {f: float(i) for f, i in feature_importance[:10]} if hasattr(final_model, 'feature_importances_') else {}
    }
    
    with open(METADATA_PATH, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"   ✅ Metadata saved to: {METADATA_PATH}")
    
    # =========================================================================
    # Summary
    # =========================================================================
    print("\n" + "=" * 70)
    if final_accuracy >= 0.85:
        print("🎉 SUCCESS! Model accuracy is above 85%!")
    else:
        print("⚠️  Model accuracy is below 85%. Consider adding more training data.")
    print(f"   Final Accuracy: {final_accuracy * 100:.2f}%")
    print("=" * 70)
    
    return True


def quick_test():
    """Quick test of the trained model."""
    print("\n🧪 Quick Model Test...")
    
    if not os.path.exists(MODEL_PATH):
        print("❌ Model not found!")
        return
    
    # Load model package
    model_package = joblib.load(MODEL_PATH)
    model = model_package['model']
    scaler = model_package['scaler']
    features = model_package['features']
    base_features = model_package['base_features']
    
    # Test samples
    test_samples = [
        {'N': 80, 'P': 50, 'K': 60, 'temperature': 25, 'humidity': 75, 'ph': 6.5, 'rainfall': 200},
        {'N': 100, 'P': 40, 'K': 50, 'temperature': 28, 'humidity': 85, 'ph': 6.0, 'rainfall': 220},
        {'N': 40, 'P': 30, 'K': 30, 'temperature': 22, 'humidity': 60, 'ph': 7.0, 'rainfall': 100},
    ]
    
    for i, sample in enumerate(test_samples, 1):
        # Create enhanced features
        df = pd.DataFrame([sample])
        df_enhanced = create_enhanced_features(df)
        X = df_enhanced[features]
        X_scaled = scaler.transform(X)
        
        prediction = model.predict(X_scaled)[0]
        probabilities = model.predict_proba(X_scaled)[0]
        max_prob = max(probabilities) * 100
        
        print(f"\n   Test {i}: N={sample['N']}, P={sample['P']}, K={sample['K']}")
        print(f"   → Prediction: {prediction} ({max_prob:.1f}% confidence)")


if __name__ == "__main__":
    success = train_enhanced_model()
    if success:
        quick_test()
