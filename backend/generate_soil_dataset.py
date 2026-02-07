"""
Kerala Soil Classification Dataset Generator
=============================================
Generates 10,000+ scientifically accurate soil samples for Kerala's 8 major soil types.

Based on agricultural research data from:
- Kerala Agricultural University (KAU)
- Indian Council of Agricultural Research (ICAR)
- Soil Survey Organizations

Each soil type has distinct characteristics:
- NPK levels
- pH range
- Temperature tolerance
- Humidity preference
- Rainfall association
"""

import pandas as pd
import numpy as np
import os
import random

# ============================================================
# KERALA SOIL TYPES - Scientific Characteristics
# ============================================================
# Based on research from Kerala Agricultural University and ICAR

KERALA_SOIL_TYPES = {
    # =====================================================
    # 1. LATERITE SOIL (Most common in Kerala - 65% of land)
    # Found in: Kannur, Kasaragod, Wayanad, Kozhikode, Malappuram
    # =====================================================
    "Laterite": {
        "N": (30, 80),         # Low to moderate nitrogen
        "P": (5, 25),          # LOW phosphorus (locked up)
        "K": (40, 100),        # Moderate to good potassium
        "temperature": (24, 34),  # Tropical warm
        "humidity": (70, 92),     # High humidity
        "ph": (4.5, 6.0),         # ACIDIC (key characteristic)
        "rainfall": (200, 350),   # High rainfall regions
        "samples": 2000,          # Most common soil
        "color": "Red to reddish-brown",
        "description": "Iron-rich acidic soil common in Kerala midlands"
    },
    
    # =====================================================
    # 2. RED LOAM (Midland transitional areas)
    # Found in: Parts of Thrissur, Palakkad, Ernakulam
    # =====================================================
    "Red Loam": {
        "N": (40, 90),         # Moderate nitrogen
        "P": (15, 40),         # Moderate phosphorus
        "K": (50, 110),        # Good potassium
        "temperature": (24, 35),
        "humidity": (65, 88),
        "ph": (5.5, 6.8),         # Slightly acidic to neutral
        "rainfall": (150, 280),
        "samples": 1500,
        "color": "Reddish",
        "description": "Fertile loamy soil suitable for diverse crops"
    },
    
    # =====================================================
    # 3. COASTAL ALLUVIAL (Beach and coastal areas)
    # Found in: Alappuzha coast, Kollam coast, Thiruvananthapuram coast
    # =====================================================
    "Coastal Alluvial": {
        "N": (25, 65),         # Low to moderate
        "P": (20, 50),         # Moderate phosphorus
        "K": (30, 80),         # Variable potassium
        "temperature": (26, 36),  # Warm coastal
        "humidity": (75, 95),     # Very high (sea influence)
        "ph": (7.0, 8.5),         # ALKALINE (salt influence)
        "rainfall": (120, 220),
        "samples": 1200,
        "color": "Grey to yellowish",
        "description": "Sandy alluvial soil with salt influence near coasts"
    },
    
    # =====================================================
    # 4. RIVERINE ALLUVIAL (River banks and deltas)
    # Found in: Along Bharathapuzha, Periyar, Pamba rivers
    # =====================================================
    "Riverine Alluvial": {
        "N": (60, 120),        # HIGH nitrogen (fertile)
        "P": (35, 70),         # Good phosphorus
        "K": (55, 120),        # High potassium
        "temperature": (24, 33),
        "humidity": (70, 90),
        "ph": (6.2, 7.5),         # Near neutral (most fertile)
        "rainfall": (180, 300),
        "samples": 1300,
        "color": "Dark brown to grey",
        "description": "Highly fertile river deposited soil"
    },
    
    # =====================================================
    # 5. BROWN HYDROMORPHIC (Waterlogged paddy fields)
    # Found in: Kuttanad, Onattukara, Kole lands
    # =====================================================
    "Brown Hydromorphic": {
        "N": (50, 100),        # Moderate to high (organic matter)
        "P": (20, 50),         # Moderate (can be locked)
        "K": (30, 75),         # Variable
        "temperature": (25, 34),
        "humidity": (80, 98),     # VERY HIGH (waterlogged)
        "ph": (4.0, 5.5),         # ACIDIC (waterlogging)
        "rainfall": (200, 320),   # High rainfall
        "samples": 1100,
        "color": "Brown to dark brown",
        "description": "Waterlogged paddy soil with high organic content"
    },
    
    # =====================================================
    # 6. FOREST LOAM (Western Ghats highlands)
    # Found in: Wayanad, Idukki, parts of Palakkad
    # =====================================================
    "Forest Loam": {
        "N": (80, 150),        # HIGH nitrogen (leaf litter)
        "P": (30, 65),         # Moderate to good
        "K": (60, 130),        # High potassium
        "temperature": (15, 26),  # COOLER (high altitude)
        "humidity": (75, 95),
        "ph": (5.0, 6.5),         # Slightly acidic
        "rainfall": (250, 400),   # VERY HIGH rainfall
        "samples": 1000,
        "color": "Dark brown to black",
        "description": "Organic-rich forest soil from Western Ghats"
    },
    
    # =====================================================
    # 7. BLACK COTTON SOIL (Limited areas)
    # Found in: Parts of Palakkad (Chittur, Alathur)
    # =====================================================
    "Black Cotton": {
        "N": (45, 95),         # Moderate nitrogen
        "P": (25, 55),         # Good phosphorus
        "K": (40, 90),         # Moderate potassium
        "temperature": (26, 38),  # Hot regions
        "humidity": (50, 75),     # Lower humidity
        "ph": (7.0, 8.5),         # ALKALINE
        "rainfall": (80, 150),    # Lower rainfall
        "samples": 700,           # Less common in Kerala
        "color": "Black to dark grey",
        "description": "Clayey black soil with high water retention"
    },
    
    # =====================================================
    # 8. PEATY/MARSHY (Kuttanad below sea level)
    # Found in: Kuttanad, parts of Alappuzha
    # =====================================================
    "Peaty": {
        "N": (100, 180),       # VERY HIGH (decomposed organic)
        "P": (15, 40),         # Low (locked in organic matter)
        "K": (25, 60),         # Low to moderate
        "temperature": (26, 34),
        "humidity": (85, 99),     # SATURATED
        "ph": (3.5, 5.0),         # VERY ACIDIC (key feature)
        "rainfall": (200, 300),
        "samples": 700,
        "color": "Black, mucky",
        "description": "Highly acidic organic soil from marsh areas"
    },
}

# Also include generic soil types for comparison
ADDITIONAL_SOIL_TYPES = {
    "Loamy": {
        "N": (50, 100),
        "P": (30, 60),
        "K": (50, 100),
        "temperature": (22, 32),
        "humidity": (60, 80),
        "ph": (6.0, 7.2),
        "rainfall": (100, 200),
        "samples": 400,
        "color": "Brown",
        "description": "Balanced fertile soil with good drainage"
    },
    "Sandy": {
        "N": (20, 50),         # LOW (leaches quickly)
        "P": (10, 35),
        "K": (20, 55),
        "temperature": (25, 38),
        "humidity": (40, 70),
        "ph": (6.0, 7.5),
        "rainfall": (50, 150),
        "samples": 400,
        "color": "Light brown to tan",
        "description": "Well-drained sandy soil with low fertility"
    },
    "Clayey": {
        "N": (50, 100),
        "P": (30, 65),
        "K": (60, 120),
        "temperature": (22, 34),
        "humidity": (65, 90),
        "ph": (6.5, 8.0),
        "rainfall": (100, 250),
        "samples": 400,
        "color": "Grey to dark",
        "description": "Heavy clay soil with poor drainage"
    },
}


def generate_samples(soil_type: str, properties: dict) -> list:
    """Generate realistic samples for a soil type with Gaussian distribution."""
    samples = []
    n_samples = properties['samples']
    
    for _ in range(n_samples):
        sample = {
            'soil_type': soil_type,
            'N': np.clip(
                np.random.normal(
                    (properties['N'][0] + properties['N'][1]) / 2,
                    (properties['N'][1] - properties['N'][0]) / 4
                ),
                properties['N'][0] * 0.9,
                properties['N'][1] * 1.1
            ),
            'P': np.clip(
                np.random.normal(
                    (properties['P'][0] + properties['P'][1]) / 2,
                    (properties['P'][1] - properties['P'][0]) / 4
                ),
                properties['P'][0] * 0.9,
                properties['P'][1] * 1.1
            ),
            'K': np.clip(
                np.random.normal(
                    (properties['K'][0] + properties['K'][1]) / 2,
                    (properties['K'][1] - properties['K'][0]) / 4
                ),
                properties['K'][0] * 0.9,
                properties['K'][1] * 1.1
            ),
            'temperature': np.clip(
                np.random.normal(
                    (properties['temperature'][0] + properties['temperature'][1]) / 2,
                    (properties['temperature'][1] - properties['temperature'][0]) / 4
                ),
                properties['temperature'][0] * 0.95,
                properties['temperature'][1] * 1.05
            ),
            'humidity': np.clip(
                np.random.normal(
                    (properties['humidity'][0] + properties['humidity'][1]) / 2,
                    (properties['humidity'][1] - properties['humidity'][0]) / 4
                ),
                properties['humidity'][0] * 0.95,
                min(100, properties['humidity'][1] * 1.02)
            ),
            'ph': np.clip(
                np.random.normal(
                    (properties['ph'][0] + properties['ph'][1]) / 2,
                    (properties['ph'][1] - properties['ph'][0]) / 4
                ),
                max(3.0, properties['ph'][0] * 0.95),
                min(9.0, properties['ph'][1] * 1.05)
            ),
            'rainfall': np.clip(
                np.random.normal(
                    (properties['rainfall'][0] + properties['rainfall'][1]) / 2,
                    (properties['rainfall'][1] - properties['rainfall'][0]) / 4
                ),
                properties['rainfall'][0] * 0.85,
                properties['rainfall'][1] * 1.15
            ),
        }
        
        # Round values
        sample['N'] = round(sample['N'], 1)
        sample['P'] = round(sample['P'], 1)
        sample['K'] = round(sample['K'], 1)
        sample['temperature'] = round(sample['temperature'], 1)
        sample['humidity'] = round(sample['humidity'], 1)
        sample['ph'] = round(sample['ph'], 2)
        sample['rainfall'] = round(sample['rainfall'], 1)
        
        samples.append(sample)
    
    return samples


def print_soil_info():
    """Print information about Kerala soil types."""
    print("\n" + "=" * 70)
    print("🌍 KERALA SOIL TYPES REFERENCE")
    print("=" * 70)
    
    for soil_type, props in KERALA_SOIL_TYPES.items():
        print(f"\n📍 {soil_type.upper()}")
        print(f"   pH Range: {props['ph'][0]} - {props['ph'][1]}")
        print(f"   N Range: {props['N'][0]} - {props['N'][1]}")
        print(f"   Description: {props['description']}")
        print(f"   Samples: {props['samples']}")


def main():
    print("=" * 70)
    print("🌾 KERALA SOIL CLASSIFICATION DATASET GENERATOR")
    print("=" * 70)
    
    all_samples = []
    
    # Generate Kerala soil samples
    print("\n📊 Generating Kerala soil samples...")
    for soil_type, props in KERALA_SOIL_TYPES.items():
        samples = generate_samples(soil_type, props)
        all_samples.extend(samples)
        print(f"   ✅ {soil_type}: {len(samples)} samples")
    
    # Generate additional generic soil samples
    print("\n📊 Generating additional soil samples...")
    for soil_type, props in ADDITIONAL_SOIL_TYPES.items():
        samples = generate_samples(soil_type, props)
        all_samples.extend(samples)
        print(f"   ✅ {soil_type}: {len(samples)} samples")
    
    # Shuffle
    random.shuffle(all_samples)
    
    # Create DataFrame
    df = pd.DataFrame(all_samples)
    
    # Reorder columns
    df = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'soil_type']]
    
    print(f"\n📈 Total samples generated: {len(df)}")
    print(f"📊 Soil types: {df['soil_type'].nunique()}")
    
    # Show distribution
    print("\n📋 Sample Distribution:")
    for soil in sorted(df['soil_type'].unique()):
        count = len(df[df['soil_type'] == soil])
        bar = "█" * (count // 50)
        print(f"   {soil:20}: {count:5} {bar}")
    
    # Show statistics
    print("\n📊 Statistics per Soil Type (Mean values):")
    stats = df.groupby('soil_type')[['N', 'P', 'K', 'ph', 'temperature', 'humidity']].mean().round(1)
    print(stats.to_string())
    
    # Save to file
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ml_model", "datasets", "soil_classification")
    os.makedirs(output_dir, exist_ok=True)
    
    # Backup old dataset
    old_dataset_path = os.path.join(output_dir, "synthetic_soil_dataset.csv")
    if os.path.exists(old_dataset_path):
        backup_path = os.path.join(output_dir, "synthetic_soil_dataset_backup.csv")
        old_df = pd.read_csv(old_dataset_path)
        old_df.to_csv(backup_path, index=False)
        print(f"\n💾 Old dataset backed up to: {backup_path}")
    
    # Save new dataset
    df.to_csv(old_dataset_path, index=False)
    print(f"✅ New dataset saved to: {old_dataset_path}")
    
    # Print soil info
    print_soil_info()
    
    print("\n" + "=" * 70)
    print("✅ Dataset generation complete!")
    print(f"   Total: {len(df)} samples for {df['soil_type'].nunique()} soil types")
    print("=" * 70)
    
    return df


if __name__ == "__main__":
    main()
