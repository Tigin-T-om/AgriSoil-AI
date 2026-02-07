"""
ML Service - Hybrid Machine Learning Service
=============================================
This service handles both:
1. Crop Recommendation (from unified_agricultural_dataset.csv)
2. Soil Classification (from synthetic_soil_dataset.csv)

Part of the AgriSoil AI Hybrid ML + Rule-Based System
"""

import joblib
import os
import json
import numpy as np
import pandas as pd
from typing import Optional, Dict, List, Any
from app.schemas.prediction import PredictionInput


class MLService:
    """
    Machine Learning Service for AgriSoil AI
    Manages both crop recommendation and soil classification models.
    Supports both standard and enhanced (high-accuracy) models.
    """
    
    # Model instances (class-level singletons)
    crop_model = None
    soil_model = None
    
    # Enhanced crop model components
    _crop_scaler = None
    _crop_features = None
    _crop_base_features = None
    _is_enhanced_model = False
    
    # Enhanced soil model components
    _soil_scaler = None
    _soil_features = None
    _soil_base_features = None
    _is_enhanced_soil_model = False
    
    # Model paths
    _models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ml_models")
    _crop_model_path = os.path.join(_models_dir, "crop_recommendation_model.joblib")
    _soil_model_path = os.path.join(_models_dir, "soil_classification_model.joblib")
    _soil_metadata_path = os.path.join(_models_dir, "soil_model_metadata.json")
    
    # Model metadata
    soil_metadata = None
    
    # Feature columns (base features for both models)
    FEATURE_COLUMNS = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    
    @classmethod
    def load_models(cls) -> Dict[str, bool]:
        """
        Load all ML models on startup.
        Returns a dict indicating which models were loaded successfully.
        """
        results = {
            "crop_model": False,
            "soil_model": False
        }
        
        # Load Crop Recommendation Model
        if cls.crop_model is None:
            results["crop_model"] = cls._load_crop_model()
        else:
            results["crop_model"] = True
            
        # Load Soil Classification Model
        if cls.soil_model is None:
            results["soil_model"] = cls._load_soil_model()
        else:
            results["soil_model"] = True
            
        return results
    
    @classmethod
    def _load_crop_model(cls) -> bool:
        """Load the crop recommendation model (supports both old and enhanced formats)."""
        if os.path.exists(cls._crop_model_path):
            try:
                loaded = joblib.load(cls._crop_model_path)
                
                # Check if it's the new enhanced model package
                if isinstance(loaded, dict) and 'model' in loaded:
                    # Enhanced model package with scaler and features
                    cls.crop_model = loaded['model']
                    cls._crop_scaler = loaded.get('scaler')
                    cls._crop_features = loaded.get('features', cls.FEATURE_COLUMNS)
                    cls._crop_base_features = loaded.get('base_features', cls.FEATURE_COLUMNS)
                    cls._is_enhanced_model = True
                    print(f"✅ Enhanced Crop Model loaded (with {len(cls._crop_features)} features)")
                else:
                    # Old format - just the model
                    cls.crop_model = loaded
                    cls._crop_scaler = None
                    cls._crop_features = cls.FEATURE_COLUMNS
                    cls._crop_base_features = cls.FEATURE_COLUMNS
                    cls._is_enhanced_model = False
                
                crop_count = len(cls.crop_model.classes_) if hasattr(cls.crop_model, 'classes_') else 0
                print(f"   📊 {crop_count} crops available")
                return True
            except Exception as e:
                print(f"❌ Failed to load crop model: {e}")
                return False
        else:
            print(f"⚠️  Crop model not found at {cls._crop_model_path}")
            return False
    
    @classmethod
    def _load_soil_model(cls) -> bool:
        """Load the soil classification model (supports both old and enhanced formats)."""
        if os.path.exists(cls._soil_model_path):
            try:
                loaded = joblib.load(cls._soil_model_path)
                
                # Check if it's the new enhanced model package
                if isinstance(loaded, dict) and 'model' in loaded:
                    # Enhanced model package with scaler and features
                    cls.soil_model = loaded['model']
                    cls._soil_scaler = loaded.get('scaler')
                    cls._soil_features = loaded.get('features', cls.FEATURE_COLUMNS)
                    cls._soil_base_features = loaded.get('base_features', cls.FEATURE_COLUMNS)
                    cls._is_enhanced_soil_model = True
                    soil_types = len(cls.soil_model.classes_) if hasattr(cls.soil_model, 'classes_') else 0
                    print(f"✅ Enhanced Soil Model loaded (with {len(cls._soil_features)} features)")
                    print(f"   📊 {soil_types} soil types: {list(cls.soil_model.classes_)[:5]}...")
                else:
                    # Old format - just the model
                    cls.soil_model = loaded
                    cls._soil_scaler = None
                    cls._soil_features = cls.FEATURE_COLUMNS
                    cls._soil_base_features = cls.FEATURE_COLUMNS
                    cls._is_enhanced_soil_model = False
                    soil_types = len(cls.soil_model.classes_) if hasattr(cls.soil_model, 'classes_') else 0
                    print(f"✅ Soil Classification Model loaded: {soil_types} soil types")
                
                # Load metadata if available
                if os.path.exists(cls._soil_metadata_path):
                    with open(cls._soil_metadata_path, 'r') as f:
                        cls.soil_metadata = json.load(f)
                    print(f"   📊 Model accuracy: {cls.soil_metadata.get('accuracy', cls.soil_metadata.get('test_accuracy', 0)) * 100:.1f}%")
                
                return True
            except Exception as e:
                print(f"❌ Failed to load soil model: {e}")
                return False
        else:
            print(f"⚠️  Soil model not found at {cls._soil_model_path}")
            return False
    
    @classmethod
    def load_model(cls):
        """
        Legacy method for backward compatibility.
        Loads all models.
        """
        cls.load_models()
    
    @classmethod
    def _prepare_input(cls, data: PredictionInput) -> pd.DataFrame:
        """Convert PredictionInput to DataFrame for model prediction."""
        return pd.DataFrame([{
            'N': data.nitrogen,
            'P': data.phosphorus,
            'K': data.potassium,
            'temperature': data.temperature,
            'humidity': data.humidity,
            'ph': data.ph,
            'rainfall': data.rainfall
        }])
    
    @classmethod
    def _create_enhanced_features(cls, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create enhanced features for the improved model.
        Matches the feature engineering in train_enhanced_model.py
        """
        df = df.copy()
        
        # Nutrient ratios
        df['N_P_ratio'] = df['N'] / (df['P'] + 1)
        df['N_K_ratio'] = df['N'] / (df['K'] + 1)
        df['P_K_ratio'] = df['P'] / (df['K'] + 1)
        
        # Total nutrients
        df['total_nutrients'] = df['N'] + df['P'] + df['K']
        
        # Nutrient balance score
        nutrient_mean = df['total_nutrients'] / 3
        df['nutrient_balance'] = 1 - (
            abs(df['N'] - nutrient_mean) + 
            abs(df['P'] - nutrient_mean) + 
            abs(df['K'] - nutrient_mean)
        ) / (df['total_nutrients'] + 1)
        
        # Environmental stress indices
        df['temp_stress'] = abs(df['temperature'] - 25) / 25
        df['humidity_stress'] = abs(df['humidity'] - 70) / 70
        df['ph_stress'] = abs(df['ph'] - 6.5) / 6.5
        df['env_stress_index'] = (df['temp_stress'] + df['humidity_stress'] + df['ph_stress']) / 3
        
        # Rainfall category
        rainfall_bins = [0, 50, 100, 150, 200, 300, 3000]
        df['rainfall_category'] = pd.cut(
            df['rainfall'],
            bins=rainfall_bins,
            labels=[0, 1, 2, 3, 4, 5]
        ).astype(int)
        
        # pH category
        ph_bins = [0, 5.5, 6.5, 7.5, 14]
        df['ph_category'] = pd.cut(
            df['ph'],
            bins=ph_bins,
            labels=[0, 1, 2, 3]
        ).astype(int)
        
        return df
    
    @classmethod
    def _prepare_enhanced_input(cls, data: PredictionInput) -> np.ndarray:
        """Prepare input with enhanced features for the improved model."""
        # Get basic input
        input_df = cls._prepare_input(data)
        
        # Add enhanced features
        enhanced_df = cls._create_enhanced_features(input_df)
        
        # Select features in correct order
        X = enhanced_df[cls._crop_features]
        
        # Scale if scaler is available
        if cls._crop_scaler is not None:
            X_scaled = cls._crop_scaler.transform(X)
            return X_scaled
        
        return X.values
    
    @classmethod
    def _create_enhanced_soil_features(cls, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create enhanced features for soil classification.
        Matches the feature engineering in train_improved_soil_model.py
        """
        df = df.copy()
        
        # Nutrient ratios
        df['N_P_ratio'] = df['N'] / (df['P'] + 1)
        df['N_K_ratio'] = df['N'] / (df['K'] + 1)
        df['P_K_ratio'] = df['P'] / (df['K'] + 1)
        
        # Total nutrients
        df['total_nutrients'] = df['N'] + df['P'] + df['K']
        
        # Nutrient balance
        nutrient_mean = df['total_nutrients'] / 3
        df['nutrient_balance'] = 1 - (
            abs(df['N'] - nutrient_mean) + 
            abs(df['P'] - nutrient_mean) + 
            abs(df['K'] - nutrient_mean)
        ) / (df['total_nutrients'] + 1)
        
        # Fertility index
        df['fertility_index'] = (df['N'] * 0.4 + df['P'] * 0.3 + df['K'] * 0.3) / 100
        
        # pH category (important for Kerala soils)
        ph_bins = [0, 5.0, 5.5, 6.5, 7.0, 7.5, 14]
        df['ph_category'] = pd.cut(
            df['ph'],
            bins=ph_bins,
            labels=[0, 1, 2, 3, 4, 5]
        ).astype(int)
        
        # Acidity score
        df['acidity_score'] = (7.0 - df['ph']) / 7.0
        
        # Humidity category
        humidity_bins = [0, 60, 70, 80, 90, 100]
        df['humidity_category'] = pd.cut(
            df['humidity'],
            bins=humidity_bins,
            labels=[0, 1, 2, 3, 4]
        ).astype(int)
        
        # Rainfall category
        rainfall_bins = [0, 100, 150, 200, 250, 500]
        df['rainfall_category'] = pd.cut(
            df['rainfall'],
            bins=rainfall_bins,
            labels=[0, 1, 2, 3, 4]
        ).astype(int)
        
        # Temperature category
        temp_bins = [0, 20, 25, 30, 35, 50]
        df['temp_category'] = pd.cut(
            df['temperature'],
            bins=temp_bins,
            labels=[0, 1, 2, 3, 4]
        ).astype(int)
        
        # NEW: Additional discriminative features (v2 model)
        df['N_K_product'] = df['N'] * df['K'] / 1000
        df['ph_humidity_ratio'] = df['ph'] / (df['humidity'] / 100 + 0.1)
        df['rainfall_temp_ratio'] = df['rainfall'] / (df['temperature'] + 1)
        
        return df
    
    @classmethod
    def _prepare_enhanced_soil_input(cls, data: PredictionInput) -> np.ndarray:
        """Prepare input with enhanced features for the improved soil model."""
        # Get basic input
        input_df = cls._prepare_input(data)
        
        # Add enhanced features
        enhanced_df = cls._create_enhanced_soil_features(input_df)
        
        # Select features in correct order
        X = enhanced_df[cls._soil_features]
        
        # Scale if scaler is available
        if cls._soil_scaler is not None:
            X_scaled = cls._soil_scaler.transform(X)
            return X_scaled
        
        return X.values
    
    @classmethod
    def predict_soil_type(cls, data: PredictionInput) -> Optional[Dict[str, Any]]:
        """
        Predict soil type from input data.
        Supports both old and enhanced (high-accuracy) models.
        
        Returns:
            Dict with:
            - predicted_type: str (Laterite, Red Loam, Coastal Alluvial, etc.)
            - confidence: float (0-100)
            - all_probabilities: Dict[str, float]
        """
        # Ensure model is loaded
        if cls.soil_model is None:
            cls._load_soil_model()
            
        if cls.soil_model is None:
            return None
        
        # Use enhanced features if enhanced model is loaded
        if getattr(cls, '_is_enhanced_soil_model', False):
            input_data = cls._prepare_enhanced_soil_input(data)
        else:
            input_data = cls._prepare_input(data)
        
        # Get prediction
        prediction = cls.soil_model.predict(input_data)[0]
        
        # Get probabilities
        probabilities = {}
        confidence = 0.0
        
        if hasattr(cls.soil_model, "predict_proba"):
            probs = cls.soil_model.predict_proba(input_data)[0]
            classes = cls.soil_model.classes_
            
            for cls_name, prob in zip(classes, probs):
                probabilities[cls_name] = round(float(prob) * 100, 2)
            
            # Get confidence for the predicted class
            pred_idx = list(classes).index(prediction)
            confidence = float(probs[pred_idx]) * 100
        
        return {
            "predicted_type": prediction,
            "confidence": round(confidence, 2),
            "all_probabilities": probabilities
        }
    
    @classmethod
    def predict_crop(cls, data: PredictionInput) -> Optional[Dict[str, Any]]:
        """
        Predict recommended crop from input data.
        Supports both old and enhanced (high-accuracy) models.
        
        Returns:
            Dict with:
            - recommended_crop: str
            - confidence: float (0-100)
            - alternatives: List[Dict] (top 3 crops with confidence)
        """
        # Ensure model is loaded
        if cls.crop_model is None:
            cls._load_crop_model()
            
        if cls.crop_model is None:
            return None
        
        # Use enhanced features if enhanced model is loaded
        if getattr(cls, '_is_enhanced_model', False):
            input_data = cls._prepare_enhanced_input(data)
        else:
            input_data = cls._prepare_input(data)
        
        prediction = cls.crop_model.predict(input_data)[0]
        
        # Calculate confidence and alternatives
        confidence = 0.0
        alternatives = []
        
        if hasattr(cls.crop_model, "predict_proba"):
            probabilities = cls.crop_model.predict_proba(input_data)[0]
            classes = cls.crop_model.classes_
            
            # Get indices of top 3 predictions
            top_indices = np.argsort(probabilities)[::-1][:3]
            
            for idx in top_indices:
                alternatives.append({
                    "crop": classes[idx],
                    "confidence": round(float(probabilities[idx]) * 100, 2)
                })
            
            # Best prediction
            top_pred_idx = top_indices[0]
            prediction = classes[top_pred_idx]
            confidence = float(probabilities[top_pred_idx]) * 100
        
        return {
            "recommended_crop": prediction,
            "confidence": round(confidence, 2),
            "alternatives": alternatives
        }
    
    @classmethod
    def predict(cls, data: PredictionInput) -> Optional[Dict[str, Any]]:
        """
        Legacy prediction method for backward compatibility.
        Returns crop recommendation only.
        """
        return cls.predict_crop(data)
    
    @classmethod
    def analyze(cls, data: PredictionInput) -> Optional[Dict[str, Any]]:
        """
        Full analysis combining both soil classification and crop recommendation.
        
        Returns:
            Dict with:
            - soil_analysis: soil classification results
            - crop_recommendation: crop prediction results
            - input_summary: echo of input values
        """
        # Get soil prediction
        soil_result = cls.predict_soil_type(data)
        
        # Get crop prediction
        crop_result = cls.predict_crop(data)
        
        if soil_result is None and crop_result is None:
            return None
        
        return {
            "soil_analysis": soil_result or {
                "predicted_type": "Unknown",
                "confidence": 0,
                "all_probabilities": {}
            },
            "crop_recommendation": crop_result or {
                "recommended_crop": "Unknown",
                "confidence": 0,
                "alternatives": []
            },
            "input_summary": {
                "nitrogen": data.nitrogen,
                "phosphorus": data.phosphorus,
                "potassium": data.potassium,
                "temperature": data.temperature,
                "humidity": data.humidity,
                "ph": data.ph,
                "rainfall": data.rainfall
            }
        }
    
    @classmethod
    def hybrid_analyze(cls, data: PredictionInput) -> Optional[Dict[str, Any]]:
        """
        Hybrid analysis combining ML predictions with rule-based validation.
        
        RULE-FILTERED RECOMMENDATION:
        If the ML-predicted crop fails rule validation (e.g., wrong soil type),
        the system automatically selects the NEXT BEST ML alternative that passes rules.
        
        This is the main method for the hybrid approach:
        1. ML: Classifies soil type from input parameters
        2. ML: Recommends the best crop for the conditions
        3. Rules: Validates all ML predictions against agricultural rules
        4. Filter: Select the BEST crop that passes rules
        5. Score: Calculate combined ML + Rule score
        6. Warnings: Generate warnings only for minor issues
        
        Returns:
            Comprehensive analysis with:
            - soil_analysis: ML soil classification
            - crop_recommendation: RULE-VALIDATED crop recommendation
            - rule_validation: Rule engine validation results
            - final_score: Combined ML + Rule score
            - warnings: List of issues detected
            - suggestions: List of improvement suggestions
            - alternative_crops: Rule-based crop suggestions
        """
        from app.services.rule_engine import RuleValidator
        
        # Step 1: Get ML soil classification
        soil_result = cls.predict_soil_type(data)
        predicted_soil = soil_result["predicted_type"] if soil_result else "Unknown"
        soil_confidence = soil_result["confidence"] if soil_result else 0
        
        # Step 2: Get ML crop recommendation with ALL alternatives
        crop_result = cls.predict_crop(data)
        ml_recommended_crop = crop_result["recommended_crop"] if crop_result else "Unknown"
        ml_crop_confidence = crop_result["confidence"] if crop_result else 0
        alternatives = crop_result["alternatives"] if crop_result else []
        
        # Step 3: RULE-FILTERED RECOMMENDATION
        # Build list of all ML-recommended crops ranked by confidence
        all_ml_crops = [{"crop": ml_recommended_crop, "confidence": ml_crop_confidence}]
        all_ml_crops.extend(alternatives)
        
        # Try to find the best crop that passes rule validation
        final_recommended_crop = None
        final_crop_confidence = 0
        final_rule_validation = None
        crops_that_failed = []  # Track which crops failed and why
        
        for crop_option in all_ml_crops:
            crop_name = crop_option["crop"]
            crop_conf = crop_option["confidence"]
            
            # Validate this crop against rules
            validation = RuleValidator.validate_crop(
                crop_name=crop_name,
                soil_type=predicted_soil,
                n=data.nitrogen,
                p=data.phosphorus,
                k=data.potassium,
                temperature=data.temperature,
                humidity=data.humidity,
                ph=data.ph,
                rainfall=data.rainfall
            )
            
            # Check if this crop has critical failures (soil type mismatch)
            validations = validation.get("validations", {})
            soil_check = validations.get("soil_type", {})
            
            # A crop is "viable" if it passes soil type check OR has no rules
            has_rules = validation.get("has_rules", False)
            soil_passed = soil_check.get("passed", True) if soil_check else True
            
            if not has_rules or soil_passed:
                # This crop passes the critical soil check - use it!
                final_recommended_crop = crop_name
                final_crop_confidence = crop_conf
                final_rule_validation = validation
                break
            else:
                # Record why this crop failed
                fail_reason = validation.get("warnings", [])
                crops_that_failed.append({
                    "crop": crop_name,
                    "confidence": crop_conf,
                    "reason": fail_reason[0] if fail_reason else "Soil type mismatch"
                })
        
        # If no ML crop passed rules, fall back to rule-based suggestions
        if final_recommended_crop is None:
            # Get rule-based crop suggestions
            rule_based_crops = RuleValidator.get_suitable_crops(
                soil_type=predicted_soil,
                n=data.nitrogen,
                p=data.phosphorus,
                k=data.potassium,
                temperature=data.temperature,
                humidity=data.humidity,
                ph=data.ph,
                rainfall=data.rainfall,
                top_n=5
            )
            
            if rule_based_crops:
                # Use the top rule-based crop
                best_rule_crop = rule_based_crops[0]
                final_recommended_crop = best_rule_crop["crop"]
                # For rule-based crops, use validation score as confidence proxy
                final_crop_confidence = best_rule_crop["validation_score"] * 0.7  # Scale down
                final_rule_validation = RuleValidator.validate_crop(
                    crop_name=final_recommended_crop,
                    soil_type=predicted_soil,
                    n=data.nitrogen,
                    p=data.phosphorus,
                    k=data.potassium,
                    temperature=data.temperature,
                    humidity=data.humidity,
                    ph=data.ph,
                    rainfall=data.rainfall
                )
            else:
                # Absolute fallback - use ML recommendation with warnings
                final_recommended_crop = ml_recommended_crop
                final_crop_confidence = ml_crop_confidence
                final_rule_validation = RuleValidator.validate_crop(
                    crop_name=ml_recommended_crop,
                    soil_type=predicted_soil,
                    n=data.nitrogen,
                    p=data.phosphorus,
                    k=data.potassium,
                    temperature=data.temperature,
                    humidity=data.humidity,
                    ph=data.ph,
                    rainfall=data.rainfall
                )
        
        # Step 4: Get rule-based crop suggestions for alternatives display
        rule_based_crops = RuleValidator.get_suitable_crops(
            soil_type=predicted_soil,
            n=data.nitrogen,
            p=data.phosphorus,
            k=data.potassium,
            temperature=data.temperature,
            humidity=data.humidity,
            ph=data.ph,
            rainfall=data.rainfall,
            top_n=5
        )
        
        # Step 5: Calculate combined score
        # Weight: 60% ML confidence + 40% Rule validation score
        ml_weight = 0.6
        rule_weight = 0.4
        
        validation_score = final_rule_validation.get("validation_score", 0) or 0
        warnings = final_rule_validation.get("warnings", [])
        all_checks_passed = final_rule_validation.get("all_passed", False)
        
        # Calculate base final score
        base_score = (final_crop_confidence * ml_weight) + (validation_score * rule_weight)
        
        # Penalty for warnings (each warning reduces score by 5%)
        warning_penalty = len(warnings) * 5
        final_score = max(0, base_score - warning_penalty)
        
        # Step 6: Determine recommendation quality
        if final_score >= 80 and all_checks_passed:
            recommendation_quality = "Excellent"
        elif final_score >= 70 and len(warnings) <= 1:
            recommendation_quality = "Good"
        elif final_score >= 50 or (validation_score >= 80 and final_crop_confidence >= 40):
            recommendation_quality = "Moderate"
        elif final_score >= 30:
            recommendation_quality = "Fair"
        else:
            recommendation_quality = "Poor"
        
        # Downgrade quality if there are significant warnings
        if len(warnings) >= 2 and recommendation_quality in ["Excellent", "Good"]:
            recommendation_quality = "Moderate"
        if len(warnings) >= 3:
            recommendation_quality = "Needs Review"
        
        # Step 7: Compile suggestions
        suggestions = final_rule_validation.get("suggestions", [])
        
        # Add context about filtering if ML crop was replaced
        if final_recommended_crop.lower() != ml_recommended_crop.lower():
            suggestions.insert(0, 
                f"✅ Selected {final_recommended_crop.capitalize()} (better suited than ML's first choice: {ml_recommended_crop})"
            )
        
        # Add info about crops that failed validation
        if crops_that_failed:
            failed_names = [c["crop"] for c in crops_that_failed[:2]]
            suggestions.append(
                f"ℹ️ Crops skipped due to soil mismatch: {', '.join(failed_names)}"
            )
        
        # Add soil confidence warning if low
        if soil_confidence < 70:
            suggestions.append("Soil classification confidence is low - consider soil testing for accurate results")
        
        # Update alternatives to show filtered results
        filtered_alternatives = []
        for crop in rule_based_crops[:3]:
            if crop["crop"].lower() != final_recommended_crop.lower():
                filtered_alternatives.append({
                    "crop": crop["crop"],
                    "confidence": crop["validation_score"]
                })
        
        return {
            "soil_analysis": {
                "predicted_type": predicted_soil,
                "confidence": soil_confidence,
                "all_probabilities": soil_result.get("all_probabilities", {}) if soil_result else {}
            },
            "crop_recommendation": {
                "recommended_crop": final_recommended_crop,
                "ml_confidence": final_crop_confidence,
                "alternatives": filtered_alternatives,
                "original_ml_prediction": ml_recommended_crop if ml_recommended_crop.lower() != final_recommended_crop.lower() else None
            },
            "rule_validation": {
                "has_rules": final_rule_validation.get("has_rules", False),
                "validation_score": validation_score,
                "all_checks_passed": all_checks_passed,
                "validations": final_rule_validation.get("validations", {}),
                "crop_description": final_rule_validation.get("crop_description", "")
            },
            "final_score": round(final_score, 1),
            "recommendation_quality": recommendation_quality,
            "warnings": warnings,
            "suggestions": suggestions,
            "alternative_crops": rule_based_crops,
            "crops_filtered_out": crops_that_failed,
            "input_summary": {
                "nitrogen": data.nitrogen,
                "phosphorus": data.phosphorus,
                "potassium": data.potassium,
                "temperature": data.temperature,
                "humidity": data.humidity,
                "ph": data.ph,
                "rainfall": data.rainfall
            }
        }
    
    @classmethod
    def get_model_status(cls) -> Dict[str, Any]:
        """
        Get the status of all loaded models.
        """
        status = {
            "crop_model": {
                "loaded": cls.crop_model is not None,
                "classes": list(cls.crop_model.classes_) if cls.crop_model and hasattr(cls.crop_model, 'classes_') else [],
                "n_classes": len(cls.crop_model.classes_) if cls.crop_model and hasattr(cls.crop_model, 'classes_') else 0
            },
            "soil_model": {
                "loaded": cls.soil_model is not None,
                "classes": list(cls.soil_model.classes_) if cls.soil_model and hasattr(cls.soil_model, 'classes_') else [],
                "n_classes": len(cls.soil_model.classes_) if cls.soil_model and hasattr(cls.soil_model, 'classes_') else 0,
                "metadata": cls.soil_metadata
            },
            "rule_engine": {
                "loaded": True,
                "crops_with_rules": 22
            }
        }
        return status

