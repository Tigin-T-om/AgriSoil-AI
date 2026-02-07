"""
Prediction API Endpoints
========================
Provides ML-based predictions for:
1. Crop Recommendation
2. Soil Classification
3. Combined Analysis (Hybrid approach)
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.prediction import (
    PredictionInput, 
    PredictionResponse, 
    SoilClassificationResponse,
    AnalysisResponse
)
from app.services.ml_service import MLService

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
def predict_crop(input_data: PredictionInput):
    """
    Predict the most suitable crop based on soil and environmental data.
    
    Returns the recommended crop with confidence score and top 3 alternatives.
    """
    try:
        result = MLService.predict_crop(input_data)
        
        if result is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The crop recommendation model has not been trained yet."
            )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post("/classify-soil", response_model=SoilClassificationResponse)
def classify_soil(input_data: PredictionInput):
    """
    Classify soil type based on NPK values and environmental conditions.
    
    Returns predicted soil type (Loamy, Clayey, Sandy, Silty) with confidence.
    """
    try:
        result = MLService.predict_soil_type(input_data)
        
        if result is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The soil classification model has not been trained yet."
            )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Soil classification failed: {str(e)}"
        )


@router.post("/analyze", response_model=AnalysisResponse)
def analyze_soil_and_crop(input_data: PredictionInput):
    """
    Full analysis combining soil classification and crop recommendation.
    
    This is the main endpoint for the hybrid ML approach:
    1. Classifies soil type from input parameters
    2. Recommends the best crop for the conditions
    3. Returns confidence scores for both predictions
    
    Returns:
        - soil_analysis: Predicted soil type with probabilities
        - crop_recommendation: Recommended crop with alternatives
        - input_summary: Echo of input values for verification
    """
    try:
        result = MLService.analyze(input_data)
        
        if result is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="ML models are not available. Please ensure models are trained."
            )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post("/hybrid-analyze")
def hybrid_analyze(input_data: PredictionInput):
    """
    🌱 HYBRID ANALYSIS - ML + Rule-Based Recommendation System
    
    This is the MAIN endpoint for comprehensive agricultural analysis.
    Combines machine learning predictions with domain-specific rules.
    
    Process:
    1. ML Soil Classification - Predicts soil type from input parameters
    2. ML Crop Recommendation - Predicts best crop using trained model
    3. Rule Validation - Validates predictions against agricultural rules
    4. Score Calculation - Combined score (60% ML + 40% Rules)
    5. Warning Generation - Identifies potential issues
    6. Suggestions - Provides improvement recommendations
    
    Returns:
        - soil_analysis: ML soil classification with confidence
        - crop_recommendation: ML crop prediction with alternatives
        - rule_validation: Rule engine validation results
        - final_score: Combined ML + Rule score (0-100)
        - recommendation_quality: Excellent/Good/Fair/Poor
        - warnings: List of identified issues
        - suggestions: List of improvement recommendations
        - alternative_crops: Rule-based crop suggestions ranked by suitability
        - input_summary: Echo of input values
    """
    try:
        result = MLService.hybrid_analyze(input_data)
        
        if result is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Hybrid analysis failed. Please ensure models are trained."
            )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hybrid analysis failed: {str(e)}"
        )


@router.get("/model-status")
def get_model_status():
    """
    Get the current status of all ML models and rule engine.
    
    Returns information about which models are loaded and their details.
    """
    try:
        model_status = MLService.get_model_status()
        return {
            "status": "ok",
            "models": model_status
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get model status: {str(e)}"
        )

