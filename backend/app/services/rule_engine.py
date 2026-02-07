"""
Rule Engine for AgriSoil AI
============================
This module provides rule-based validation for crop recommendations.
It works alongside the ML models to provide a hybrid prediction system.

Features:
- Crop-specific rules (pH ranges, nutrient needs, soil preferences)
- Validation functions for each rule
- Confidence score adjustments based on rule matches
- Warning generation for suboptimal conditions
- Suggestion generation for improvements

Part of the AgriSoil AI Hybrid ML + Rule-Based System
"""

from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class NutrientLevel(Enum):
    """Nutrient requirement levels."""
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"


class DrainageType(Enum):
    """Soil drainage requirements."""
    POOR = "Poor"
    MODERATE = "Moderate"
    GOOD = "Good"
    EXCELLENT = "Excellent"


@dataclass
class CropRule:
    """Definition of rules for a specific crop."""
    crop_name: str
    ph_min: float
    ph_max: float
    ph_optimal_min: float
    ph_optimal_max: float
    preferred_soils: List[str]
    acceptable_soils: List[str]
    min_rainfall: float
    max_rainfall: float
    optimal_rainfall_min: float
    optimal_rainfall_max: float
    min_temperature: float
    max_temperature: float
    optimal_temp_min: float
    optimal_temp_max: float
    nitrogen_need: NutrientLevel
    phosphorus_need: NutrientLevel
    potassium_need: NutrientLevel
    min_humidity: float
    max_humidity: float
    description: str


# ============================================================================
# CROP RULES DATABASE
# ============================================================================
# Comprehensive rules for each crop based on agricultural research

CROP_RULES: Dict[str, CropRule] = {
    "rice": CropRule(
        crop_name="Rice",
        ph_min=5.0, ph_max=8.0, ph_optimal_min=5.5, ph_optimal_max=6.5,
        preferred_soils=["Clayey", "Loamy", "Riverine Alluvial", "Coastal Alluvial"],
        acceptable_soils=["Silty", "Black Cotton"],
        min_rainfall=150, max_rainfall=300, optimal_rainfall_min=180, optimal_rainfall_max=250,
        min_temperature=20, max_temperature=40, optimal_temp_min=22, optimal_temp_max=32,
        nitrogen_need=NutrientLevel.HIGH,
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.MODERATE,
        min_humidity=70, max_humidity=100,
        description="Paddy crop requiring flooded conditions and high water availability"
    ),
    "wheat": CropRule(
        crop_name="Wheat",
        ph_min=5.5, ph_max=8.0, ph_optimal_min=6.0, ph_optimal_max=7.0,
        preferred_soils=["Loamy", "Clayey"],
        acceptable_soils=["Silty"],
        min_rainfall=50, max_rainfall=150, optimal_rainfall_min=75, optimal_rainfall_max=100,
        min_temperature=10, max_temperature=30, optimal_temp_min=12, optimal_temp_max=25,
        nitrogen_need=NutrientLevel.HIGH,
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.LOW,
        min_humidity=50, max_humidity=85,
        description="Major cereal crop preferring cool and dry conditions"
    ),
    "maize": CropRule(
        crop_name="Maize",
        ph_min=5.5, ph_max=8.0, ph_optimal_min=5.8, ph_optimal_max=7.0,
        preferred_soils=["Loamy", "Sandy"],
        acceptable_soils=["Clayey", "Silty"],
        min_rainfall=60, max_rainfall=120, optimal_rainfall_min=80, optimal_rainfall_max=110,
        min_temperature=18, max_temperature=35, optimal_temp_min=21, optimal_temp_max=30,
        nitrogen_need=NutrientLevel.HIGH,
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.MODERATE,
        min_humidity=50, max_humidity=80,
        description="Versatile grain crop adaptable to various conditions"
    ),
    "cotton": CropRule(
        crop_name="Cotton",
        ph_min=5.5, ph_max=8.5, ph_optimal_min=6.0, ph_optimal_max=7.5,
        preferred_soils=["Clayey", "Loamy"],
        acceptable_soils=["Silty"],
        min_rainfall=50, max_rainfall=150, optimal_rainfall_min=80, optimal_rainfall_max=120,
        min_temperature=20, max_temperature=40, optimal_temp_min=25, optimal_temp_max=35,
        nitrogen_need=NutrientLevel.HIGH,
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.HIGH,
        min_humidity=40, max_humidity=70,
        description="Fiber crop requiring warm temperatures and moderate water"
    ),
    "jute": CropRule(
        crop_name="Jute",
        ph_min=5.0, ph_max=8.0, ph_optimal_min=6.0, ph_optimal_max=7.0,
        preferred_soils=["Loamy", "Clayey"],
        acceptable_soils=["Silty"],
        min_rainfall=150, max_rainfall=250, optimal_rainfall_min=170, optimal_rainfall_max=230,
        min_temperature=25, max_temperature=38, optimal_temp_min=27, optimal_temp_max=35,
        nitrogen_need=NutrientLevel.HIGH,
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.MODERATE,
        min_humidity=70, max_humidity=90,
        description="Fiber crop requiring warm and humid conditions"
    ),
    "coffee": CropRule(
        crop_name="Coffee",
        ph_min=4.5, ph_max=6.5, ph_optimal_min=5.0, ph_optimal_max=6.0,
        preferred_soils=["Loamy", "Forest Loam", "Red Loam", "Laterite"],
        acceptable_soils=["Clayey", "Silty", "Brown Hydromorphic"],
        min_rainfall=150, max_rainfall=300, optimal_rainfall_min=180, optimal_rainfall_max=250,
        min_temperature=15, max_temperature=30, optimal_temp_min=18, optimal_temp_max=25,
        nitrogen_need=NutrientLevel.MODERATE,
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.HIGH,
        min_humidity=60, max_humidity=90,
        description="Plantation crop preferring shade and consistent moisture"
    ),
    "banana": CropRule(
        crop_name="Banana",
        ph_min=5.5, ph_max=7.5, ph_optimal_min=6.0, ph_optimal_max=7.0,
        preferred_soils=["Loamy", "Riverine Alluvial", "Coastal Alluvial"],
        acceptable_soils=["Clayey", "Silty", "Red Loam", "Laterite"],
        min_rainfall=100, max_rainfall=250, optimal_rainfall_min=150, optimal_rainfall_max=200,
        min_temperature=20, max_temperature=35, optimal_temp_min=25, optimal_temp_max=32,
        nitrogen_need=NutrientLevel.HIGH,
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.HIGH,
        min_humidity=70, max_humidity=90,
        description="Tropical fruit requiring consistent warmth and moisture"
    ),
    "mango": CropRule(
        crop_name="Mango",
        ph_min=5.5, ph_max=7.5, ph_optimal_min=6.0, ph_optimal_max=7.0,
        preferred_soils=["Loamy", "Sandy", "Red Loam", "Laterite"],
        acceptable_soils=["Clayey", "Forest Loam", "Brown Hydromorphic"],
        min_rainfall=75, max_rainfall=250, optimal_rainfall_min=100, optimal_rainfall_max=200,
        min_temperature=21, max_temperature=45, optimal_temp_min=24, optimal_temp_max=35,
        nitrogen_need=NutrientLevel.MODERATE,
        phosphorus_need=NutrientLevel.LOW,
        potassium_need=NutrientLevel.MODERATE,
        min_humidity=40, max_humidity=80,
        description="Tropical fruit tree requiring hot temperatures and seasonal rains"
    ),
    "apple": CropRule(
        crop_name="Apple",
        ph_min=5.5, ph_max=7.0, ph_optimal_min=6.0, ph_optimal_max=6.8,
        preferred_soils=["Loamy"],
        acceptable_soils=["Sandy", "Silty"],
        min_rainfall=100, max_rainfall=200, optimal_rainfall_min=125, optimal_rainfall_max=175,
        min_temperature=8, max_temperature=28, optimal_temp_min=10, optimal_temp_max=22,
        nitrogen_need=NutrientLevel.MODERATE,
        phosphorus_need=NutrientLevel.LOW,
        potassium_need=NutrientLevel.MODERATE,
        min_humidity=50, max_humidity=80,
        description="Temperate fruit requiring cold winters for dormancy"
    ),
    "grapes": CropRule(
        crop_name="Grapes",
        ph_min=5.5, ph_max=8.0, ph_optimal_min=6.0, ph_optimal_max=7.0,
        preferred_soils=["Loamy", "Sandy"],
        acceptable_soils=["Clayey"],
        min_rainfall=50, max_rainfall=150, optimal_rainfall_min=75, optimal_rainfall_max=100,
        min_temperature=15, max_temperature=40, optimal_temp_min=20, optimal_temp_max=35,
        nitrogen_need=NutrientLevel.MODERATE,
        phosphorus_need=NutrientLevel.LOW,
        potassium_need=NutrientLevel.HIGH,
        min_humidity=40, max_humidity=70,
        description="Vine fruit preferring warm, dry conditions"
    ),
    "orange": CropRule(
        crop_name="Orange",
        ph_min=5.0, ph_max=8.0, ph_optimal_min=5.5, ph_optimal_max=7.0,
        preferred_soils=["Loamy", "Sandy"],
        acceptable_soils=["Clayey"],
        min_rainfall=100, max_rainfall=200, optimal_rainfall_min=120, optimal_rainfall_max=180,
        min_temperature=13, max_temperature=38, optimal_temp_min=20, optimal_temp_max=30,
        nitrogen_need=NutrientLevel.MODERATE,
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.MODERATE,
        min_humidity=50, max_humidity=80,
        description="Citrus fruit requiring subtropical climate"
    ),
    "papaya": CropRule(
        crop_name="Papaya",
        ph_min=5.5, ph_max=7.5, ph_optimal_min=6.0, ph_optimal_max=7.0,
        preferred_soils=["Loamy", "Sandy"],
        acceptable_soils=["Silty"],
        min_rainfall=100, max_rainfall=250, optimal_rainfall_min=150, optimal_rainfall_max=200,
        min_temperature=20, max_temperature=38, optimal_temp_min=25, optimal_temp_max=32,
        nitrogen_need=NutrientLevel.HIGH,
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.HIGH,
        min_humidity=60, max_humidity=85,
        description="Tropical fruit requiring warm temperatures year-round"
    ),
    "coconut": CropRule(
        crop_name="Coconut",
        ph_min=5.0, ph_max=8.0, ph_optimal_min=5.5, ph_optimal_max=7.0,
        preferred_soils=["Sandy", "Loamy", "Coastal Alluvial", "Laterite", "Red Loam"],
        acceptable_soils=["Clayey", "Riverine Alluvial"],
        min_rainfall=150, max_rainfall=300, optimal_rainfall_min=180, optimal_rainfall_max=250,
        min_temperature=20, max_temperature=35, optimal_temp_min=25, optimal_temp_max=32,
        nitrogen_need=NutrientLevel.MODERATE,
        phosphorus_need=NutrientLevel.LOW,
        potassium_need=NutrientLevel.HIGH,
        min_humidity=70, max_humidity=95,
        description="Coastal palm preferring sandy soils and high humidity"
    ),
    "chickpea": CropRule(
        crop_name="Chickpea",
        ph_min=5.5, ph_max=8.5, ph_optimal_min=6.0, ph_optimal_max=7.5,
        preferred_soils=["Loamy", "Clayey"],
        acceptable_soils=["Sandy", "Silty"],
        min_rainfall=40, max_rainfall=100, optimal_rainfall_min=60, optimal_rainfall_max=80,
        min_temperature=10, max_temperature=30, optimal_temp_min=15, optimal_temp_max=25,
        nitrogen_need=NutrientLevel.LOW,  # Legume - fixes nitrogen
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.LOW,
        min_humidity=40, max_humidity=70,
        description="Pulse crop that fixes nitrogen, prefers cool and dry conditions"
    ),
    "lentil": CropRule(
        crop_name="Lentil",
        ph_min=5.5, ph_max=8.0, ph_optimal_min=6.0, ph_optimal_max=7.0,
        preferred_soils=["Loamy", "Sandy"],
        acceptable_soils=["Clayey", "Silty"],
        min_rainfall=25, max_rainfall=100, optimal_rainfall_min=40, optimal_rainfall_max=75,
        min_temperature=10, max_temperature=30, optimal_temp_min=15, optimal_temp_max=25,
        nitrogen_need=NutrientLevel.LOW,  # Legume
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.LOW,
        min_humidity=30, max_humidity=70,
        description="Pulse crop tolerant to dry conditions"
    ),
    "pigeonpeas": CropRule(
        crop_name="Pigeonpeas",
        ph_min=5.0, ph_max=8.0, ph_optimal_min=5.5, ph_optimal_max=7.0,
        preferred_soils=["Loamy", "Sandy"],
        acceptable_soils=["Clayey"],
        min_rainfall=60, max_rainfall=150, optimal_rainfall_min=80, optimal_rainfall_max=120,
        min_temperature=18, max_temperature=35, optimal_temp_min=22, optimal_temp_max=30,
        nitrogen_need=NutrientLevel.LOW,  # Legume
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.LOW,
        min_humidity=40, max_humidity=80,
        description="Drought-tolerant legume for semi-arid regions"
    ),
    "mothbeans": CropRule(
        crop_name="Mothbeans",
        ph_min=5.0, ph_max=8.5, ph_optimal_min=6.0, ph_optimal_max=7.5,
        preferred_soils=["Sandy", "Loamy"],
        acceptable_soils=["Clayey"],
        min_rainfall=25, max_rainfall=75, optimal_rainfall_min=35, optimal_rainfall_max=60,
        min_temperature=24, max_temperature=40, optimal_temp_min=28, optimal_temp_max=35,
        nitrogen_need=NutrientLevel.LOW,
        phosphorus_need=NutrientLevel.LOW,
        potassium_need=NutrientLevel.LOW,
        min_humidity=30, max_humidity=60,
        description="Highly drought-tolerant legume for arid regions"
    ),
    "mungbean": CropRule(
        crop_name="Mungbean",
        ph_min=5.5, ph_max=8.0, ph_optimal_min=6.0, ph_optimal_max=7.0,
        preferred_soils=["Loamy", "Sandy"],
        acceptable_soils=["Clayey"],
        min_rainfall=50, max_rainfall=100, optimal_rainfall_min=60, optimal_rainfall_max=85,
        min_temperature=20, max_temperature=38, optimal_temp_min=25, optimal_temp_max=32,
        nitrogen_need=NutrientLevel.LOW,
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.LOW,
        min_humidity=50, max_humidity=80,
        description="Fast-growing pulse crop for warm conditions"
    ),
    "blackgram": CropRule(
        crop_name="Blackgram",
        ph_min=5.5, ph_max=8.0, ph_optimal_min=6.0, ph_optimal_max=7.0,
        preferred_soils=["Loamy", "Clayey"],
        acceptable_soils=["Sandy", "Silty"],
        min_rainfall=60, max_rainfall=120, optimal_rainfall_min=75, optimal_rainfall_max=100,
        min_temperature=25, max_temperature=38, optimal_temp_min=27, optimal_temp_max=33,
        nitrogen_need=NutrientLevel.LOW,
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.LOW,
        min_humidity=60, max_humidity=85,
        description="Legume crop preferring warm and humid conditions"
    ),
    "kidneybeans": CropRule(
        crop_name="Kidneybeans",
        ph_min=5.5, ph_max=7.5, ph_optimal_min=6.0, ph_optimal_max=7.0,
        preferred_soils=["Loamy"],
        acceptable_soils=["Clayey", "Sandy"],
        min_rainfall=60, max_rainfall=150, optimal_rainfall_min=80, optimal_rainfall_max=120,
        min_temperature=15, max_temperature=30, optimal_temp_min=18, optimal_temp_max=25,
        nitrogen_need=NutrientLevel.LOW,
        phosphorus_need=NutrientLevel.HIGH,
        potassium_need=NutrientLevel.MODERATE,
        min_humidity=50, max_humidity=80,
        description="Bean crop preferring moderate temperatures"
    ),
    "pomegranate": CropRule(
        crop_name="Pomegranate",
        ph_min=5.5, ph_max=8.0, ph_optimal_min=6.0, ph_optimal_max=7.5,
        preferred_soils=["Loamy", "Sandy"],
        acceptable_soils=["Clayey"],
        min_rainfall=50, max_rainfall=150, optimal_rainfall_min=75, optimal_rainfall_max=120,
        min_temperature=18, max_temperature=40, optimal_temp_min=22, optimal_temp_max=35,
        nitrogen_need=NutrientLevel.MODERATE,
        phosphorus_need=NutrientLevel.LOW,
        potassium_need=NutrientLevel.MODERATE,
        min_humidity=35, max_humidity=70,
        description="Drought-tolerant fruit tree for semi-arid regions"
    ),
    "watermelon": CropRule(
        crop_name="Watermelon",
        ph_min=5.5, ph_max=7.5, ph_optimal_min=6.0, ph_optimal_max=7.0,
        preferred_soils=["Sandy", "Loamy"],
        acceptable_soils=["Silty"],
        min_rainfall=40, max_rainfall=80, optimal_rainfall_min=50, optimal_rainfall_max=70,
        min_temperature=22, max_temperature=38, optimal_temp_min=25, optimal_temp_max=32,
        nitrogen_need=NutrientLevel.MODERATE,
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.HIGH,
        min_humidity=50, max_humidity=80,
        description="Vine fruit requiring warm temperatures and sandy soil"
    ),
    "muskmelon": CropRule(
        crop_name="Muskmelon",
        ph_min=5.5, ph_max=7.5, ph_optimal_min=6.0, ph_optimal_max=6.8,
        preferred_soils=["Sandy", "Loamy"],
        acceptable_soils=["Silty"],
        min_rainfall=35, max_rainfall=75, optimal_rainfall_min=45, optimal_rainfall_max=65,
        min_temperature=20, max_temperature=38, optimal_temp_min=24, optimal_temp_max=32,
        nitrogen_need=NutrientLevel.MODERATE,
        phosphorus_need=NutrientLevel.MODERATE,
        potassium_need=NutrientLevel.HIGH,
        min_humidity=45, max_humidity=75,
        description="Melon preferring warm, dry conditions"
    ),
}


# ============================================================================
# RULE VALIDATION FUNCTIONS
# ============================================================================

class RuleValidator:
    """
    Validates crop recommendations against agricultural rules.
    Provides a hybrid approach combining ML predictions with domain knowledge.
    """
    
    @staticmethod
    def get_nutrient_level(value: float, nutrient_type: str) -> NutrientLevel:
        """
        Classify nutrient level based on value.
        
        Thresholds:
        - Nitrogen (N): Low <40, Moderate 40-80, High >80
        - Phosphorus (P): Low <30, Moderate 30-60, High >60
        - Potassium (K): Low <40, Moderate 40-70, High >70
        """
        thresholds = {
            "N": {"low": 40, "high": 80},
            "P": {"low": 30, "high": 60},
            "K": {"low": 40, "high": 70}
        }
        
        thresh = thresholds.get(nutrient_type, {"low": 40, "high": 70})
        
        if value < thresh["low"]:
            return NutrientLevel.LOW
        elif value > thresh["high"]:
            return NutrientLevel.HIGH
        else:
            return NutrientLevel.MODERATE
    
    @staticmethod
    def validate_ph(ph: float, rule: CropRule) -> Tuple[bool, bool, str]:
        """
        Validate pH against crop rules.
        
        Returns:
            Tuple of (is_acceptable, is_optimal, message)
        """
        if rule.ph_optimal_min <= ph <= rule.ph_optimal_max:
            return True, True, f"pH {ph} is optimal (ideal: {rule.ph_optimal_min}-{rule.ph_optimal_max})"
        elif rule.ph_min <= ph <= rule.ph_max:
            return True, False, f"pH {ph} is acceptable but not optimal (optimal: {rule.ph_optimal_min}-{rule.ph_optimal_max})"
        else:
            return False, False, f"pH {ph} is outside acceptable range ({rule.ph_min}-{rule.ph_max})"
    
    @staticmethod
    def validate_soil_type(soil_type: str, rule: CropRule) -> Tuple[bool, bool, str]:
        """
        Validate soil type against crop rules.
        
        Returns:
            Tuple of (is_acceptable, is_preferred, message)
        """
        if soil_type in rule.preferred_soils:
            return True, True, f"{soil_type} soil is preferred for {rule.crop_name}"
        elif soil_type in rule.acceptable_soils:
            return True, False, f"{soil_type} soil is acceptable for {rule.crop_name} (preferred: {', '.join(rule.preferred_soils)})"
        else:
            return False, False, f"{soil_type} soil is not recommended for {rule.crop_name} (suitable: {', '.join(rule.preferred_soils + rule.acceptable_soils)})"
    
    @staticmethod
    def validate_rainfall(rainfall: float, rule: CropRule) -> Tuple[bool, bool, str]:
        """
        Validate rainfall against crop rules.
        
        Returns:
            Tuple of (is_acceptable, is_optimal, message)
        """
        if rule.optimal_rainfall_min <= rainfall <= rule.optimal_rainfall_max:
            return True, True, f"Rainfall {rainfall}mm is optimal"
        elif rule.min_rainfall <= rainfall <= rule.max_rainfall:
            return True, False, f"Rainfall {rainfall}mm is acceptable (optimal: {rule.optimal_rainfall_min}-{rule.optimal_rainfall_max}mm)"
        elif rainfall < rule.min_rainfall:
            return False, False, f"Rainfall {rainfall}mm is too low (minimum: {rule.min_rainfall}mm)"
        else:
            return False, False, f"Rainfall {rainfall}mm is too high (maximum: {rule.max_rainfall}mm)"
    
    @staticmethod
    def validate_temperature(temperature: float, rule: CropRule) -> Tuple[bool, bool, str]:
        """
        Validate temperature against crop rules.
        
        Returns:
            Tuple of (is_acceptable, is_optimal, message)
        """
        if rule.optimal_temp_min <= temperature <= rule.optimal_temp_max:
            return True, True, f"Temperature {temperature}°C is optimal"
        elif rule.min_temperature <= temperature <= rule.max_temperature:
            return True, False, f"Temperature {temperature}°C is acceptable (optimal: {rule.optimal_temp_min}-{rule.optimal_temp_max}°C)"
        elif temperature < rule.min_temperature:
            return False, False, f"Temperature {temperature}°C is too low (minimum: {rule.min_temperature}°C)"
        else:
            return False, False, f"Temperature {temperature}°C is too high (maximum: {rule.max_temperature}°C)"
    
    @staticmethod
    def validate_humidity(humidity: float, rule: CropRule) -> Tuple[bool, bool, str]:
        """
        Validate humidity against crop rules.
        
        Returns:
            Tuple of (is_acceptable, is_optimal, message)
        """
        mid_humidity = (rule.min_humidity + rule.max_humidity) / 2
        optimal_range = (rule.max_humidity - rule.min_humidity) * 0.3
        
        if (mid_humidity - optimal_range) <= humidity <= (mid_humidity + optimal_range):
            return True, True, f"Humidity {humidity}% is optimal"
        elif rule.min_humidity <= humidity <= rule.max_humidity:
            return True, False, f"Humidity {humidity}% is acceptable"
        else:
            return False, False, f"Humidity {humidity}% is outside acceptable range ({rule.min_humidity}-{rule.max_humidity}%)"
    
    @staticmethod
    def validate_nutrients(n: float, p: float, k: float, rule: CropRule) -> Tuple[bool, List[str]]:
        """
        Validate nutrient levels against crop needs.
        
        Returns:
            Tuple of (all_adequate, list of messages)
        """
        messages = []
        all_adequate = True
        
        n_level = RuleValidator.get_nutrient_level(n, "N")
        p_level = RuleValidator.get_nutrient_level(p, "P")
        k_level = RuleValidator.get_nutrient_level(k, "K")
        
        # Check Nitrogen
        if rule.nitrogen_need == NutrientLevel.HIGH and n_level != NutrientLevel.HIGH:
            messages.append(f"⚠️ Nitrogen: {rule.crop_name} needs HIGH nitrogen, current level is {n_level.value}")
            all_adequate = False
        elif rule.nitrogen_need == NutrientLevel.LOW and n_level == NutrientLevel.HIGH:
            messages.append(f"ℹ️ Nitrogen: Excess nitrogen detected, {rule.crop_name} needs LOW nitrogen")
        else:
            messages.append(f"✅ Nitrogen level ({n_level.value}) is suitable")
        
        # Check Phosphorus
        if rule.phosphorus_need == NutrientLevel.HIGH and p_level != NutrientLevel.HIGH:
            messages.append(f"⚠️ Phosphorus: {rule.crop_name} needs HIGH phosphorus, current level is {p_level.value}")
            all_adequate = False
        elif rule.phosphorus_need == NutrientLevel.LOW and p_level == NutrientLevel.HIGH:
            messages.append(f"ℹ️ Phosphorus: Excess phosphorus detected, {rule.crop_name} needs LOW phosphorus")
        else:
            messages.append(f"✅ Phosphorus level ({p_level.value}) is suitable")
        
        # Check Potassium
        if rule.potassium_need == NutrientLevel.HIGH and k_level != NutrientLevel.HIGH:
            messages.append(f"⚠️ Potassium: {rule.crop_name} needs HIGH potassium, current level is {k_level.value}")
            all_adequate = False
        elif rule.potassium_need == NutrientLevel.LOW and k_level == NutrientLevel.HIGH:
            messages.append(f"ℹ️ Potassium: Excess potassium detected, {rule.crop_name} needs LOW potassium")
        else:
            messages.append(f"✅ Potassium level ({k_level.value}) is suitable")
        
        return all_adequate, messages
    
    @classmethod
    def validate_crop(
        cls,
        crop_name: str,
        soil_type: str,
        n: float,
        p: float,
        k: float,
        temperature: float,
        humidity: float,
        ph: float,
        rainfall: float
    ) -> Dict[str, Any]:
        """
        Full validation of crop suitability based on all parameters.
        
        Returns:
            Dictionary containing validation results, score, warnings, and suggestions
        """
        crop_key = crop_name.lower()
        
        # Check if we have rules for this crop
        if crop_key not in CROP_RULES:
            return {
                "has_rules": False,
                "crop": crop_name,
                "message": f"No validation rules available for {crop_name}",
                "validation_score": None,
                "validations": {},
                "warnings": [],
                "suggestions": []
            }
        
        rule = CROP_RULES[crop_key]
        
        validations = {}
        warnings = []
        suggestions = []
        score_components = []
        
        # 1. Validate pH
        ph_acceptable, ph_optimal, ph_msg = cls.validate_ph(ph, rule)
        validations["ph"] = {
            "passed": ph_acceptable,
            "optimal": ph_optimal,
            "message": ph_msg
        }
        if ph_optimal:
            score_components.append(1.0)
        elif ph_acceptable:
            score_components.append(0.7)
            suggestions.append(f"Adjust pH to {rule.ph_optimal_min}-{rule.ph_optimal_max} for optimal growth")
        else:
            score_components.append(0.0)
            warnings.append(f"pH {ph} is unsuitable for {crop_name}")
        
        # 2. Validate Soil Type
        soil_acceptable, soil_preferred, soil_msg = cls.validate_soil_type(soil_type, rule)
        validations["soil_type"] = {
            "passed": soil_acceptable,
            "preferred": soil_preferred,
            "message": soil_msg
        }
        if soil_preferred:
            score_components.append(1.0)
        elif soil_acceptable:
            score_components.append(0.7)
            suggestions.append(f"Consider {', '.join(rule.preferred_soils)} soil for better results")
        else:
            score_components.append(0.0)
            warnings.append(f"{soil_type} soil is not suitable for {crop_name}")
        
        # 3. Validate Rainfall
        rain_acceptable, rain_optimal, rain_msg = cls.validate_rainfall(rainfall, rule)
        validations["rainfall"] = {
            "passed": rain_acceptable,
            "optimal": rain_optimal,
            "message": rain_msg
        }
        if rain_optimal:
            score_components.append(1.0)
        elif rain_acceptable:
            score_components.append(0.7)
        else:
            score_components.append(0.3)
            if rainfall < rule.min_rainfall:
                warnings.append(f"Insufficient rainfall for {crop_name} - consider irrigation")
            else:
                warnings.append(f"Excessive rainfall may affect {crop_name}")
        
        # 4. Validate Temperature
        temp_acceptable, temp_optimal, temp_msg = cls.validate_temperature(temperature, rule)
        validations["temperature"] = {
            "passed": temp_acceptable,
            "optimal": temp_optimal,
            "message": temp_msg
        }
        if temp_optimal:
            score_components.append(1.0)
        elif temp_acceptable:
            score_components.append(0.7)
        else:
            score_components.append(0.2)
            warnings.append(f"Temperature {temperature}°C may stress the crop")
        
        # 5. Validate Humidity
        hum_acceptable, hum_optimal, hum_msg = cls.validate_humidity(humidity, rule)
        validations["humidity"] = {
            "passed": hum_acceptable,
            "optimal": hum_optimal,
            "message": hum_msg
        }
        if hum_optimal:
            score_components.append(1.0)
        elif hum_acceptable:
            score_components.append(0.8)
        else:
            score_components.append(0.4)
            suggestions.append("Consider humidity management techniques")
        
        # 6. Validate Nutrients
        nutrients_adequate, nutrient_msgs = cls.validate_nutrients(n, p, k, rule)
        validations["nutrients"] = {
            "passed": nutrients_adequate,
            "details": nutrient_msgs
        }
        if nutrients_adequate:
            score_components.append(1.0)
        else:
            score_components.append(0.6)
            for msg in nutrient_msgs:
                if "⚠️" in msg:
                    warnings.append(msg.replace("⚠️ ", ""))
        
        # Calculate overall validation score (0-100)
        validation_score = (sum(score_components) / len(score_components)) * 100 if score_components else 0
        
        return {
            "has_rules": True,
            "crop": crop_name,
            "crop_description": rule.description,
            "validation_score": round(validation_score, 1),
            "validations": validations,
            "warnings": warnings,
            "suggestions": suggestions,
            "all_passed": all(v.get("passed", True) for v in validations.values() if isinstance(v, dict))
        }
    
    @classmethod
    def get_suitable_crops(
        cls,
        soil_type: str,
        n: float,
        p: float,
        k: float,
        temperature: float,
        humidity: float,
        ph: float,
        rainfall: float,
        top_n: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find the most suitable crops based on the input conditions.
        Uses rule engine to score all crops and return the best matches.
        
        IMPORTANT: Only returns crops that pass the SOIL TYPE check.
        
        Returns:
            List of crops sorted by validation score (highest first)
        """
        results = []
        
        for crop_name in CROP_RULES.keys():
            validation = cls.validate_crop(
                crop_name=crop_name,
                soil_type=soil_type,
                n=n, p=p, k=k,
                temperature=temperature,
                humidity=humidity,
                ph=ph,
                rainfall=rainfall
            )
            
            if validation["validation_score"] is not None:
                # CRITICAL: Only include crops that pass the soil type check
                soil_check = validation["validations"].get("soil_type", {})
                soil_passed = soil_check.get("passed", False)
                
                if soil_passed:
                    results.append({
                        "crop": crop_name.capitalize(),
                        "validation_score": validation["validation_score"],
                        "all_passed": validation["all_passed"],
                        "warnings_count": len(validation["warnings"]),
                        "description": CROP_RULES[crop_name].description,
                        "soil_compatible": True
                    })
        
        # Sort by validation score (highest first)
        results.sort(key=lambda x: x["validation_score"], reverse=True)
        
        return results[:top_n]

