"""
Scientific Agricultural Dataset Generator
==========================================
Generates 10,000+ scientifically accurate crop-soil-environment combinations
Based on real agricultural research data for each crop.

This ensures ML model learns correct crop-condition relationships.
"""

import pandas as pd
import numpy as np
import os
import random

# Define scientifically accurate ranges for each crop
# Based on agricultural research and best practices

CROP_CONDITIONS = {
    # =====================================================
    # CEREALS & GRAINS
    # =====================================================
    "rice": {
        "N": (80, 140),       # High nitrogen requirement
        "P": (40, 70),        # Moderate phosphorus
        "K": (40, 80),        # Moderate potassium
        "temperature": (22, 32),  # Warm tropical
        "humidity": (75, 95),     # High humidity (flooded)
        "ph": (5.5, 6.8),         # Slightly acidic
        "rainfall": (150, 300),   # High rainfall
        "samples": 600
    },
    "wheat": {
        "N": (60, 120),
        "P": (35, 60),
        "K": (25, 50),
        "temperature": (12, 25),  # Cool to moderate
        "humidity": (50, 75),
        "ph": (6.0, 7.5),
        "rainfall": (50, 120),    # Moderate rainfall
        "samples": 550
    },
    "maize": {
        "N": (70, 130),
        "P": (35, 65),
        "K": (35, 70),
        "temperature": (18, 32),
        "humidity": (55, 80),
        "ph": (5.8, 7.2),
        "rainfall": (60, 120),
        "samples": 550
    },
    
    # =====================================================
    # PULSES & LEGUMES (Fix nitrogen - legumes need LESS)
    # =====================================================
    "chickpea": {
        "N": (15, 45),        # LOW - fixes own nitrogen
        "P": (30, 60),
        "K": (20, 45),
        "temperature": (15, 28),
        "humidity": (40, 65),
        "ph": (6.0, 7.8),
        "rainfall": (40, 90),
        "samples": 450
    },
    "lentil": {
        "N": (15, 40),        # LOW
        "P": (25, 55),
        "K": (20, 45),
        "temperature": (12, 25),
        "humidity": (35, 65),
        "ph": (6.0, 7.5),
        "rainfall": (30, 80),
        "samples": 400
    },
    "kidneybeans": {
        "N": (20, 50),        # LOW-MODERATE
        "P": (45, 80),        # HIGH phosphorus need
        "K": (30, 60),
        "temperature": (15, 27),
        "humidity": (55, 75),
        "ph": (6.0, 7.2),
        "rainfall": (70, 130),
        "samples": 400
    },
    "pigeonpeas": {
        "N": (15, 45),
        "P": (30, 60),
        "K": (20, 45),
        "temperature": (20, 35),
        "humidity": (45, 75),
        "ph": (5.5, 7.5),
        "rainfall": (60, 130),
        "samples": 400
    },
    "mothbeans": {
        "N": (10, 35),        # Very LOW
        "P": (15, 40),
        "K": (15, 35),
        "temperature": (25, 38),  # Hot climate
        "humidity": (30, 55),     # Dry conditions
        "ph": (6.0, 8.0),
        "rainfall": (25, 60),     # Low rainfall
        "samples": 350
    },
    "mungbean": {
        "N": (15, 45),
        "P": (30, 60),
        "K": (25, 50),
        "temperature": (22, 35),
        "humidity": (55, 78),
        "ph": (6.0, 7.5),
        "rainfall": (55, 95),
        "samples": 400
    },
    "blackgram": {
        "N": (20, 50),
        "P": (35, 65),
        "K": (25, 50),
        "temperature": (25, 35),
        "humidity": (60, 82),
        "ph": (6.0, 7.5),
        "rainfall": (65, 110),
        "samples": 400
    },
    
    # =====================================================
    # FIBER CROPS
    # =====================================================
    "cotton": {
        "N": (80, 140),       # High nitrogen
        "P": (40, 70),
        "K": (60, 100),       # High potassium
        "temperature": (22, 38),
        "humidity": (45, 70),
        "ph": (6.0, 7.8),
        "rainfall": (60, 130),
        "samples": 500
    },
    "jute": {
        "N": (90, 150),       # HIGH nitrogen - critical
        "P": (40, 75),
        "K": (45, 80),
        "temperature": (26, 38),  # Very warm
        "humidity": (75, 92),     # HIGH humidity
        "ph": (5.8, 7.2),
        "rainfall": (170, 280),   # HIGH rainfall (flooding)
        "samples": 500
    },
    
    # =====================================================
    # FRUITS
    # =====================================================
    "mango": {
        "N": (40, 80),        # Moderate nitrogen
        "P": (20, 50),        # Low-moderate phosphorus
        "K": (40, 80),
        "temperature": (24, 38),  # Hot tropical
        "humidity": (45, 75),
        "ph": (5.8, 7.2),
        "rainfall": (80, 200),
        "samples": 600
    },
    "banana": {
        "N": (80, 140),       # High nitrogen
        "P": (35, 65),
        "K": (80, 140),       # Very high potassium
        "temperature": (24, 34),
        "humidity": (70, 92),
        "ph": (5.8, 7.2),
        "rainfall": (120, 220),
        "samples": 550
    },
    "papaya": {
        "N": (70, 130),
        "P": (40, 70),
        "K": (70, 120),       # High potassium
        "temperature": (22, 35),
        "humidity": (65, 85),
        "ph": (6.0, 7.2),
        "rainfall": (110, 210),
        "samples": 500
    },
    "apple": {
        "N": (40, 80),
        "P": (25, 50),
        "K": (45, 85),
        "temperature": (10, 24),  # Cool climate
        "humidity": (55, 78),
        "ph": (5.8, 7.0),
        "rainfall": (100, 180),
        "samples": 450
    },
    "grapes": {
        "N": (40, 90),
        "P": (25, 55),
        "K": (60, 110),       # High potassium
        "temperature": (18, 38),
        "humidity": (45, 70),     # Dry preferred
        "ph": (6.0, 7.5),
        "rainfall": (50, 110),    # Low-moderate
        "samples": 500
    },
    "orange": {
        "N": (50, 100),
        "P": (35, 65),
        "K": (50, 95),
        "temperature": (18, 32),
        "humidity": (55, 78),
        "ph": (5.5, 7.2),
        "rainfall": (100, 190),
        "samples": 500
    },
    "pomegranate": {
        "N": (40, 85),
        "P": (25, 55),
        "K": (45, 90),
        "temperature": (20, 38),
        "humidity": (40, 68),     # Semi-arid
        "ph": (6.0, 7.8),
        "rainfall": (55, 130),
        "samples": 450
    },
    "watermelon": {
        "N": (50, 100),
        "P": (40, 75),
        "K": (70, 130),       # High potassium
        "temperature": (22, 35),
        "humidity": (55, 78),
        "ph": (6.0, 7.2),
        "rainfall": (40, 80),     # Low but consistent
        "samples": 400
    },
    "muskmelon": {
        "N": (50, 100),
        "P": (40, 70),
        "K": (65, 120),
        "temperature": (22, 35),
        "humidity": (50, 72),
        "ph": (6.0, 7.0),
        "rainfall": (35, 70),
        "samples": 400
    },
    
    # =====================================================
    # PLANTATION CROPS
    # =====================================================
    "coffee": {
        "N": (50, 100),
        "P": (35, 65),
        "K": (70, 120),       # High potassium
        "temperature": (16, 28),  # Moderate
        "humidity": (65, 88),
        "ph": (5.0, 6.2),         # Acidic preferred
        "rainfall": (150, 280),
        "samples": 500
    },
    "coconut": {
        "N": (40, 90),
        "P": (20, 50),
        "K": (80, 150),       # Very high potassium
        "temperature": (24, 35),
        "humidity": (75, 95),
        "ph": (5.5, 7.2),
        "rainfall": (150, 280),
        "samples": 500
    },
}


def generate_samples(crop_name: str, conditions: dict) -> list:
    """Generate realistic samples for a crop with some natural variation."""
    samples = []
    n_samples = conditions['samples']
    
    for _ in range(n_samples):
        # Generate values within crop's ideal range with some gaussian variation
        sample = {
            'crop': crop_name,
            'N': np.clip(
                np.random.normal(
                    (conditions['N'][0] + conditions['N'][1]) / 2,
                    (conditions['N'][1] - conditions['N'][0]) / 4
                ),
                conditions['N'][0] * 0.9,
                conditions['N'][1] * 1.1
            ),
            'P': np.clip(
                np.random.normal(
                    (conditions['P'][0] + conditions['P'][1]) / 2,
                    (conditions['P'][1] - conditions['P'][0]) / 4
                ),
                conditions['P'][0] * 0.9,
                conditions['P'][1] * 1.1
            ),
            'K': np.clip(
                np.random.normal(
                    (conditions['K'][0] + conditions['K'][1]) / 2,
                    (conditions['K'][1] - conditions['K'][0]) / 4
                ),
                conditions['K'][0] * 0.9,
                conditions['K'][1] * 1.1
            ),
            'temperature': np.clip(
                np.random.normal(
                    (conditions['temperature'][0] + conditions['temperature'][1]) / 2,
                    (conditions['temperature'][1] - conditions['temperature'][0]) / 4
                ),
                conditions['temperature'][0] * 0.95,
                conditions['temperature'][1] * 1.05
            ),
            'humidity': np.clip(
                np.random.normal(
                    (conditions['humidity'][0] + conditions['humidity'][1]) / 2,
                    (conditions['humidity'][1] - conditions['humidity'][0]) / 4
                ),
                conditions['humidity'][0] * 0.95,
                min(100, conditions['humidity'][1] * 1.05)
            ),
            'ph': np.clip(
                np.random.normal(
                    (conditions['ph'][0] + conditions['ph'][1]) / 2,
                    (conditions['ph'][1] - conditions['ph'][0]) / 4
                ),
                conditions['ph'][0] * 0.98,
                conditions['ph'][1] * 1.02
            ),
            'rainfall': np.clip(
                np.random.normal(
                    (conditions['rainfall'][0] + conditions['rainfall'][1]) / 2,
                    (conditions['rainfall'][1] - conditions['rainfall'][0]) / 4
                ),
                conditions['rainfall'][0] * 0.9,
                conditions['rainfall'][1] * 1.1
            ),
        }
        
        # Round values appropriately
        sample['N'] = round(sample['N'], 1)
        sample['P'] = round(sample['P'], 1)
        sample['K'] = round(sample['K'], 1)
        sample['temperature'] = round(sample['temperature'], 1)
        sample['humidity'] = round(sample['humidity'], 1)
        sample['ph'] = round(sample['ph'], 2)
        sample['rainfall'] = round(sample['rainfall'], 1)
        
        samples.append(sample)
    
    return samples


def main():
    print("=" * 70)
    print("🌾 SCIENTIFIC AGRICULTURAL DATASET GENERATOR")
    print("=" * 70)
    
    all_samples = []
    
    print("\n📊 Generating samples for each crop...")
    
    for crop_name, conditions in CROP_CONDITIONS.items():
        samples = generate_samples(crop_name, conditions)
        all_samples.extend(samples)
        print(f"   ✅ {crop_name.capitalize()}: {len(samples)} samples")
    
    # Shuffle the data
    random.shuffle(all_samples)
    
    # Create DataFrame
    df = pd.DataFrame(all_samples)
    
    # Reorder columns
    df = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'crop']]
    
    print(f"\n📈 Total samples generated: {len(df)}")
    print(f"📊 Crops: {df['crop'].nunique()}")
    
    # Show distribution
    print("\n📋 Sample Distribution:")
    for crop in sorted(df['crop'].unique()):
        count = len(df[df['crop'] == crop])
        bar = "█" * (count // 20)
        print(f"   {crop:15}: {count:4} {bar}")
    
    # Save to file
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ml_model", "datasets", "combined")
    os.makedirs(output_dir, exist_ok=True)
    
    # Backup old dataset
    old_dataset_path = os.path.join(output_dir, "unified_agricultural_dataset.csv")
    if os.path.exists(old_dataset_path):
        backup_path = os.path.join(output_dir, "unified_agricultural_dataset_backup.csv")
        old_df = pd.read_csv(old_dataset_path)
        old_df.to_csv(backup_path, index=False)
        print(f"\n💾 Old dataset backed up to: {backup_path}")
    
    # Save new dataset
    df.to_csv(old_dataset_path, index=False)
    print(f"✅ New dataset saved to: {old_dataset_path}")
    
    # Show sample data
    print("\n🔍 Sample Data (first 10 rows):")
    print(df.head(10).to_string(index=False))
    
    # Show crop-specific stats for verification
    print("\n📊 Crop Statistics (Mean values):")
    stats = df.groupby('crop').mean().round(1)
    print(stats.to_string())
    
    print("\n" + "=" * 70)
    print("✅ Dataset generation complete!")
    print(f"   Total: {len(df)} samples for {df['crop'].nunique()} crops")
    print("=" * 70)
    
    return df


if __name__ == "__main__":
    main()
