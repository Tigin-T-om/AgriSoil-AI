#!/usr/bin/env python3
"""
Train Unified Soil Classification Model
Creates the missing soil classification models for Agri-Soil AI
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import warnings
warnings.filterwarnings('ignore')

def train_unified_soil_model():
    """Train unified soil classification model"""
    print("=" * 60)
    print("TRAINING UNIFIED SOIL CLASSIFICATION MODEL")
    print("=" * 60)
    
    # Create model directory
    model_dir = 'models'
    os.makedirs(model_dir, exist_ok=True)
    
    try:
        # Load soil dataset
        print("Loading soil classification dataset...")
        df = pd.read_csv('datasets/soil_classification/synthetic_soil_dataset.csv')
        print(f"Loaded {len(df):,} soil samples")
        
        # Prepare features and target
        feature_columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        X = df[feature_columns].values
        y = df['soil_type'].values
        
        print(f"Features: {feature_columns}")
        print(f"Soil types: {np.unique(y)}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"Training samples: {len(X_train):,}")
        print(f"Test samples: {len(X_test):,}")
        
        # Create and fit scaler
        print("\nFitting feature scaler...")
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Create and fit label encoder
        print("Fitting label encoder...")
        encoder = LabelEncoder()
        y_train_encoded = encoder.fit_transform(y_train)
        y_test_encoded = encoder.transform(y_test)
        
        # Train RandomForest classifier
        print("\nTraining RandomForest classifier...")
        classifier = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        
        classifier.fit(X_train_scaled, y_train_encoded)
        
        # Evaluate model
        print("\nEvaluating model...")
        y_pred = classifier.predict(X_test_scaled)
        accuracy = accuracy_score(y_test_encoded, y_pred)
        
        # Cross-validation
        cv_scores = cross_val_score(classifier, X_train_scaled, y_train_encoded, cv=5)
        
        print(f"Test Accuracy: {accuracy:.4f}")
        print(f"CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        # Feature importance
        feature_importance = dict(zip(feature_columns, classifier.feature_importances_))
        print(f"\nFeature Importance:")
        for feature, importance in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
            print(f"  {feature}: {importance:.4f}")
        
        # Create model info
        model_info = {
            'model_type': 'RandomForestClassifier',
            'accuracy': accuracy,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'feature_columns': feature_columns,
            'soil_types': encoder.classes_.tolist(),
            'feature_importance': feature_importance,
            'description': 'Unified soil classification model for Kerala agriculture',
            'training_samples': len(X_train),
            'test_samples': len(X_test)
        }
        
        # Save models
        print(f"\nSaving models to {model_dir}/...")
        
        # Save classifier
        classifier_path = os.path.join(model_dir, 'unified_soil_model.joblib')
        joblib.dump(classifier, classifier_path)
        print(f"  Classifier: {classifier_path}")
        
        # Save scaler
        scaler_path = os.path.join(model_dir, 'unified_soil_scaler.joblib')
        joblib.dump(scaler, scaler_path)
        print(f"  Scaler: {scaler_path}")
        
        # Save encoder
        encoder_path = os.path.join(model_dir, 'unified_soil_encoder.joblib')
        joblib.dump(encoder, encoder_path)
        print(f"  Encoder: {encoder_path}")
        
        # Save model info
        info_path = os.path.join(model_dir, 'unified_soil_info.joblib')
        joblib.dump(model_info, info_path)
        print(f"  Info: {info_path}")
        
        print(f"\nSoil classification model training complete!")
        print(f"Model accuracy: {accuracy:.1%}")
        print(f"Soil types supported: {len(encoder.classes_)}")
        
        return {
            'status': 'success',
            'accuracy': accuracy,
            'cv_mean': cv_scores.mean(),
            'soil_types': encoder.classes_.tolist(),
            'model_paths': {
                'classifier': classifier_path,
                'scaler': scaler_path,
                'encoder': encoder_path,
                'info': info_path
            }
        }
        
    except Exception as e:
        print(f"ERROR: {e}")
        return {'status': 'error', 'error': str(e)}

def test_soil_model():
    """Test the trained soil model"""
    print("\n" + "=" * 60)
    print("TESTING SOIL CLASSIFICATION MODEL")
    print("=" * 60)
    
    model_dir = 'models'
    
    try:
        # Load models
        classifier = joblib.load(os.path.join(model_dir, 'unified_soil_model.joblib'))
        scaler = joblib.load(os.path.join(model_dir, 'unified_soil_scaler.joblib'))
        encoder = joblib.load(os.path.join(model_dir, 'unified_soil_encoder.joblib'))
        info = joblib.load(os.path.join(model_dir, 'unified_soil_info.joblib'))
        
        # Test samples
        test_samples = [
            [100, 50, 80, 25, 70, 6.5, 1000],  # Good conditions
            [30, 20, 40, 20, 60, 5.5, 800],     # Moderate conditions
            [150, 100, 120, 30, 80, 7.5, 1500] # High nutrient conditions
        ]
        
        print("Testing with sample data:")
        for i, sample in enumerate(test_samples, 1):
            # Scale features
            sample_scaled = scaler.transform([sample])
            
            # Predict
            prediction_encoded = classifier.predict(sample_scaled)[0]
            prediction = encoder.inverse_transform([prediction_encoded])[0]
            
            # Get probabilities
            probabilities = classifier.predict_proba(sample_scaled)[0]
            confidence = np.max(probabilities)
            
            print(f"  Sample {i}: {prediction} (confidence: {confidence:.3f})")
            print(f"    Features: N={sample[0]}, P={sample[1]}, K={sample[2]}, temp={sample[3]}, humidity={sample[4]}, pH={sample[5]}, rainfall={sample[6]}")
        
        print(f"\nModel Info:")
        print(f"  Type: {info['model_type']}")
        print(f"  Accuracy: {info['accuracy']:.1%}")
        print(f"  Soil Types: {info['soil_types']}")
        
    except Exception as e:
        print(f"ERROR testing model: {e}")

def main():
    """Main training function"""
    print("AGRI-SOIL AI SOIL CLASSIFICATION TRAINING")
    print("Training unified soil classification model...")
    
    # Train soil model
    result = train_unified_soil_model()
    
    if result['status'] == 'success':
        # Test model
        test_soil_model()
        print(f"\nSOIL MODEL TRAINING COMPLETE!")
        print("Soil classification model is ready for production!")
    else:
        print(f"\nTRAINING FAILED: {result['error']}")
    
    return result

if __name__ == "__main__":
    result = main()


