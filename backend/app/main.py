from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.models import User, Product, Order, OrderItem  # Import models to register them
from app.api.v1 import api_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="E-commerce API for selling seeds and crops for farmers",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.on_event("startup")
async def startup_event():
    from app.services.ml_service import MLService
    import os
    
    print("\n" + "=" * 60)
    print("🌱 AgriSoil AI - Starting Up...")
    print("=" * 60)
    
    # Pre-load BOTH ML models
    print("\n📦 Loading ML Models...")
    model_status = MLService.load_models()
    
    # Summary
    loaded_count = sum(1 for v in model_status.values() if v)
    print(f"\n📊 Models loaded: {loaded_count}/{len(model_status)}")
    
    # Database and Environment logs
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    if db_path.startswith("./"):
        db_path = os.path.join(os.getcwd(), db_path[2:])
    
    print(f"\n🔧 Configuration:")
    print(f"   ENV file: {os.path.abspath(env_path)} (exists={os.path.exists(env_path)})")
    print(f"   Database: SQLite -> {os.path.abspath(db_path)}")
    
    print("\n" + "=" * 60)
    print("✅ AgriSoil AI Backend Ready!")
    print("=" * 60 + "\n")

# CORS middleware - MUST be added before other middleware and routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "message": "Welcome to AgriSoil AI E-commerce API",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
