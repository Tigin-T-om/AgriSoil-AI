"""
Enhanced Soil Classification Model Training
============================================
Trains an improved soil classifier for Kerala's 11 soil types with:
1. Feature engineering
2. Hyperparameter tuning (GridSearchCV)
3. Higher accuracy targeting

Dataset: 10,700+ samples
Soil Types: 8 Kerala + 3 Generic = 11 types
Target: >90% accuracy
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
DATA_PATH = os.path.join(BASE_DIR, "..", "ml_model", "datasets", "soil_classification", "synthetic_soil_dataset.csv")
MODEL_DIR = os.path.join(BASE_DIR, "app", "ml_models")
MODEL_PATH = os.path.join(MODEL_DIR, "soil_classification_model.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "soil_model_metadata.json")


def create_enhanced_features(df):
    """Create enhanced features for soil classification."""
    df = df.copy()
    
    # Nutrient ratios (important for soil type identification)
    df['N_P_ratio'] = df['N'] / (df['P'] + 1)
    df['N_K_ratio'] = df['N'] / (df['K'] + 1)
    df['P_K_ratio'] = df['P'] / (df['K'] + 1)
    
    # Total nutrients
    df['total_nutrients'] = df['N'] + df['P'] + df['K']
    
    # pH category (very important for Kerala soils)
    # < 5.5 = very acidic (Laterite, Peaty)
    # 5.5-6.5 = slightly acidic (Forest Loam, Red Loam)
    # 6.5-7.5 = neutral (Riverine Alluvial, Loamy)
    # > 7.5 = alkaline (Coastal Alluvial, Black Cotton)
    df['ph_category'] = pd.cut(
        df['ph'],
        bins=[0, 5.0, 5.5, 6.5, 7.0, 7.5, 14],
        labels=[0, 1, 2, 3, 4, 5]
    ).astype(int)
    
    # Acidity score (0 = alkaline, 1 = very acidic)
    df['acidity_score'] = (7.0 - df['ph']) / 7.0
    
    # Humidity category (important for Kerala)
    df['humidity_category'] = pd.cut(
        df['humidity'],
        bins=[0, 60, 70, 80, 90, 100],
        labels=[0, 1, 2, 3, 4]
    ).astype(int)
    
    # Rainfall intensity
    df['rainfall_category'] = pd.cut(
        df['rainfall'],
        bins=[0, 100, 150, 200, 250, 500],
        labels=[0, 1, 2, 3, 4]
    ).astype(int)
    
    # Temperature range (cool forests vs hot coastal)
    df['temp_category'] = pd.cut(
        df['temperature'],
        bins=[0, 20, 25, 30, 35, 50],
        labels=[0, 1, 2, 3, 4]
    ).astype(int)
    
    # NPK balance indicator
    nutrient_mean = df['total_nutrients'] / 3
    df['nutrient_balance'] = 1 - (
        abs(df['N'] - nutrient_mean) + 
        abs(df['P'] - nutrient_mean) + 
        abs(df['K'] - nutrient_mean)
    ) / (df['total_nutrients'] + 1)
    
    # Fertility index (simplified)
    df['fertility_index'] = (df['N'] * 0.4 + df['P'] * 0.3 + df['K'] * 0.3) / 100
    
    return df


def train_enhanced_soil_model():
    """Train an enhanced soil classification model."""
    print("=" * 70)
    print("🌍 ENHANCED KERALA SOIL CLASSIFICATION MODEL TRAINING")
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
    target_column = 'soil_type'
    
    # Get soil types
    soil_types = sorted(df[target_column].unique().tolist())
    print(f"\n📊 Dataset Overview:")
    print(f"   - Samples: {len(df)}")
    print(f"   - Soil Types: {len(soil_types)}")
    for st in soil_types:
        count = len(df[df[target_column] == st])
        print(f"     • {st}: {count} samples")
    
    # Create enhanced features
    print("\n🔧 Creating enhanced features...")
    df_enhanced = create_enhanced_features(df)
    
    # Enhanced feature list
    enhanced_features = base_features + [
        'N_P_ratio', 'N_K_ratio', 'P_K_ratio',
        'total_nutrients', 'nutrient_balance', 'fertility_index',
        'ph_category', 'acidity_score',
        'humidity_category', 'rainfall_category', 'temp_category'
    ]
    
    print(f"   - Total features: {len(enhanced_features)}")
    
    # Prepare data
    X = df_enhanced[enhanced_features]
    y = df_enhanced[target_column]
    
    # Split data with stratification
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
    # Train with Hyperparameter Tuning
    # =========================================================================
    print("\n" + "=" * 50)
    print("🌲 Training Optimized Random Forest...")
    print("=" * 50)
    
    # Parameter grid
    param_grid = {
        'n_estimators': [200, 300],
        'max_depth': [15, 20, 25, None],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2]
    }
    
    print("   🔍 Running GridSearchCV for hyperparameter tuning...")
    
    rf_base = RandomForestClassifier(random_state=42, n_jobs=-1)
    grid_search = GridSearchCV(
        rf_base, 
        param_grid, 
        cv=5, 
        scoring='accuracy',
        n_jobs=-1,
        verbose=0
    )
    grid_search.fit(X_train_scaled, y_train)
    
    best_params = grid_search.best_params_
    print(f"   ✅ Best parameters: {best_params}")
    print(f"   📊 Best CV Score: {grid_search.best_score_ * 100:.2f}%")
    
    # Train final model
    print("\n   🎯 Training final model with best parameters...")
    
    model = RandomForestClassifier(
        **best_params,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n   📈 Results:")
    print(f"      Test Accuracy: {accuracy * 100:.2f}%")
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
    print(f"      CV Accuracy: {cv_scores.mean() * 100:.2f}% (±{cv_scores.std() * 100:.2f}%)")
    
    # Feature Importance
    print("\n🎯 Feature Importance (Top 10):")
    importance = model.feature_importances_
    feature_importance = sorted(
        zip(enhanced_features, importance), 
        key=lambda x: x[1], 
        reverse=True
    )
    for i, (feature, imp) in enumerate(feature_importance[:10], 1):
        bar = "█" * int(imp * 50)
        print(f"   {i:2}. {feature:20}: {imp:.4f} {bar}")
    
    # Classification Report
    print("\n📋 Classification Report:")
    print("-" * 60)
    report = classification_report(y_test, y_pred)
    print(report)
    
    # =========================================================================
    # Save Model
    # =========================================================================
    print("\n💾 Saving model...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # Save as package with scaler
    model_package = {
        'model': model,
        'scaler': scaler,
        'features': enhanced_features,
        'base_features': base_features
    }
    
    joblib.dump(model_package, MODEL_PATH)
    print(f"   ✅ Model saved to: {MODEL_PATH}")
    
    # Save metadata
    metadata = {
        "model_type": "RandomForest (Tuned)",
        "accuracy": float(accuracy),
        "cv_accuracy": float(cv_scores.mean()),
        "n_features": len(enhanced_features),
        "base_features": base_features,
        "enhanced_features": enhanced_features,
        "n_classes": len(soil_types),
        "classes": soil_types,
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "best_params": best_params,
        "feature_importance": {f: float(i) for f, i in feature_importance[:10]}
    }
    
    with open(METADATA_PATH, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"   ✅ Metadata saved to: {METADATA_PATH}")
    
    # =========================================================================
    # Summary
    # =========================================================================
    print("\n" + "=" * 70)
    if accuracy >= 0.90:
        print("🎉 SUCCESS! Model accuracy is above 90%!")
    elif accuracy >= 0.85:
        print("✅ Good accuracy achieved (85%+)")
    else:
        print("⚠️ Model accuracy could be improved with more data")
    print(f"   Final Accuracy: {accuracy * 100:.2f}%")
    print(f"   Soil Types: {len(soil_types)}")
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
    
    # Check if new format
    if isinstance(model_package, dict) and 'model' in model_package:
        model = model_package['model']
        scaler = model_package['scaler']
        features = model_package['features']
        
        # Test samples for different Kerala soil types
        test_samples = [
            # Laterite (acidic, low P)
            {'N': 50, 'P': 15, 'K': 70, 'temperature': 29, 'humidity': 82, 'ph': 5.2, 'rainfall': 280},
            # Riverine Alluvial (fertile, neutral)
            {'N': 90, 'P': 55, 'K': 90, 'temperature': 28, 'humidity': 78, 'ph': 6.8, 'rainfall': 240},
            # Forest Loam (high N, cool, very acidic)
            {'N': 120, 'P': 45, 'K': 100, 'temperature': 20, 'humidity': 88, 'ph': 5.5, 'rainfall': 350},
            # Peaty (very acidic, very high N)
            {'N': 150, 'P': 25, 'K': 40, 'temperature': 30, 'humidity': 95, 'ph': 4.2, 'rainfall': 260},
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
            
            print(f"\n   Test {i}: pH={sample['ph']}, N={sample['N']}, Temp={sample['temperature']}")
            print(f"   → Prediction: {prediction} ({max_prob:.1f}% confidence)")
    else:
        print("   Old model format detected, basic test only")


if __name__ == "__main__":
    success = train_enhanced_soil_model()
    if success:
        quick_test()
