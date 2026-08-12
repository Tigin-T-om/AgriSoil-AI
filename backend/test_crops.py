import io
import sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.services.ml_service import MLService
MLService.load_models()
from app.schemas.prediction import PredictionInput

tests = [
    ('Coffee', dict(nitrogen=60, phosphorus=45, potassium=100, ph=5.5, temperature=22, humidity=75, rainfall=2500, drainage='Good')),
    ('Rice', dict(nitrogen=120, phosphorus=45, potassium=55, ph=6.0, temperature=28, humidity=85, rainfall=2500, drainage='Poor')),
    ('Coconut', dict(nitrogen=60, phosphorus=20, potassium=90, ph=6.5, temperature=28, humidity=80, rainfall=2500, drainage='Good')),
    ('Banana', dict(nitrogen=120, phosphorus=45, potassium=90, ph=6.5, temperature=28, humidity=80, rainfall=2000, drainage='Good')),
    ('Mango', dict(nitrogen=60, phosphorus=35, potassium=60, ph=6.5, temperature=30, humidity=60, rainfall=1700, drainage='Good'))
]

out = []
for name, kwargs in tests:
    data = PredictionInput(**kwargs)
    r = MLService.hybrid_analyze(data)
    out.append(f'{name} -> Soil: {r["soil_analysis"]["predicted_type"]}, Crop: {r["crop_recommendation"]["recommended_crop"]} (Conf: {r["final_score"]}%)')

with open('out.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
