from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, List, Optional

class PredictionInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    # Valid Input Ranges (Kerala-specific)
    # Nitrogen (N): 0-1000 ppm
    # Phosphorus (P): 0-300 ppm
    # Potassium (K): 0-650 ppm
    # pH Level: 3.0-9.5
    # Temperature: 18-40°C
    # Humidity: 30-100%
    # Rainfall (annual): 20-6000 mm

    nitrogen: float = Field(..., ge=0, le=1000, alias="N")
    phosphorus: float = Field(..., ge=0, le=300, alias="P")
    potassium: float = Field(..., ge=0, le=650, alias="K")
    temperature: float = Field(..., ge=8, le=55)
    humidity: float = Field(..., ge=14, le=100)
    ph: float = Field(..., ge=3.0, le=9.5, alias="ph")
    rainfall: float = Field(..., ge=20, le=6000)
    drainage: str = Field(default="Good", description="Soil drainage level: Poor, Moderate, Good")


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
    drainage: str = "Good"


class AnalysisResponse(BaseModel):
    """Combined analysis response with both soil and crop predictions."""
    soil_analysis: SoilClassificationResponse
    crop_recommendation: PredictionResponse
    input_summary: InputSummary

