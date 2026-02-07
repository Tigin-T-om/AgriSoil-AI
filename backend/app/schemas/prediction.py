from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, List, Optional

class PredictionInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    # Valid Input Ranges
    # Nitrogen (N): 0-300 ppm
    # Phosphorus (P): 5-300 ppm
    # Potassium (K): 5-400 ppm
    # pH Level: 3.5-10.0
    # Temperature: 8-55°C
    # Humidity: 14-100%
    # Rainfall: 20-2000 mm

    nitrogen: float = Field(..., ge=0, le=300, alias="N")
    phosphorus: float = Field(..., ge=5, le=300, alias="P")
    potassium: float = Field(..., ge=5, le=400, alias="K")
    temperature: float = Field(..., ge=8, le=55)
    humidity: float = Field(..., ge=14, le=100)
    ph: float = Field(..., ge=3.5, le=10.0, alias="ph")
    rainfall: float = Field(..., ge=20, le=3000)


class CropAlternative(BaseModel):
    """Alternative crop recommendation with confidence."""
    crop: str
    confidence: float


class PredictionResponse(BaseModel):
    """Response for crop prediction endpoint."""
    recommended_crop: str
    confidence: float = 0.0
    alternatives: List[CropAlternative] = []


class SoilClassificationResponse(BaseModel):
    """Response for soil classification endpoint."""
    predicted_type: str
    confidence: float = 0.0
    all_probabilities: Dict[str, float] = {}


class InputSummary(BaseModel):
    """Echo of input values."""
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float


class AnalysisResponse(BaseModel):
    """Combined analysis response with both soil and crop predictions."""
    soil_analysis: SoilClassificationResponse
    crop_recommendation: PredictionResponse
    input_summary: InputSummary

