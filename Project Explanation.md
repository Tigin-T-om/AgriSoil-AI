# 🌱 AgriSoil AI (AgroNova) — Complete Project Explanation

> **An AI-powered agricultural intelligence platform that combines machine learning with domain-specific rules to deliver accurate soil analysis, smart crop recommendations, and an integrated e-commerce marketplace for seeds and agricultural products — specifically tailored for Kerala, India.**

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement & Goal](#2-problem-statement--goal)
3. [Target Users](#3-target-users)
4. [System Architecture](#4-system-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Features & Functionalities](#6-features--functionalities)
7. [Machine Learning System](#7-machine-learning-system)
8. [Datasets](#8-datasets)
9. [Algorithms & Models](#9-algorithms--models)
10. [Rule Engine (Domain Knowledge)](#10-rule-engine-domain-knowledge)
11. [Hybrid Intelligence System](#11-hybrid-intelligence-system)
12. [Authentication & Security](#12-authentication--security)
13. [Database Design](#13-database-design)
14. [API Endpoints](#14-api-endpoints)
15. [Frontend Pages & Components](#15-frontend-pages--components)
16. [Project Structure](#16-project-structure)
17. [How It All Works Together](#17-how-it-all-works-together)

---

## 1. Project Overview

**AgriSoil AI** (branded as **AgroNova** on the frontend) is a full-stack web application that helps farmers and agricultural stakeholders make data-driven decisions about soil management and crop selection. It is specifically designed for the agricultural landscape of **Kerala, India**, recognizing 11 distinct soil types including 8 Kerala-specific varieties.

The platform brings together three core capabilities:

| Capability | Description |
|-----------|-------------|
| 🔬 **AI Soil Analysis** | Classifies soil type from NPK, pH, temperature, humidity, and rainfall data |
| 🌾 **Smart Crop Recommendations** | Recommends the best crop for given soil and environmental conditions |
| 🛒 **Integrated E-commerce** | Marketplace for seeds and products linked to soil analysis results |

What makes this project unique is its **Hybrid Intelligence System** — it doesn't rely solely on ML predictions. Instead, it validates every ML prediction against a comprehensive **Rule Engine** containing agricultural domain knowledge for 22+ crops, ensuring recommendations are scientifically sound.

---

## 2. Problem Statement & Goal

### The Problem

Farmers in Kerala face several challenges:

- **Diverse Soil Types**: Kerala has 8+ distinct soil types (Laterite, Riverine Alluvial, Forest Loam, etc.), each requiring different treatment and crop selection strategies.
- **Lack of Access to Soil Testing**: Professional soil analysis is expensive and not easily accessible to small-scale farmers.
- **Incorrect Crop Selection**: Choosing the wrong crop for a soil type leads to poor yields, wasted resources, and financial loss.
- **No Unified Platform**: Farmers must visit multiple places — soil testing labs, agricultural advisors, seed shops — to make informed decisions.

### The Goal

Build an **all-in-one AI-powered platform** that:

1. **Accepts 7 soil/environmental parameters** (Nitrogen, Phosphorus, Potassium, pH, Temperature, Humidity, Rainfall)
2. **Classifies the soil type** using a trained ML model
3. **Recommends the best crop** using another ML model, validated by agricultural rules
4. **Provides a confidence score** and quality rating for each recommendation
5. **Suggests related products** (seeds, fertilizers) that the farmer can purchase directly
6. **Manages the entire workflow**: from analysis → recommendation → purchase → order tracking

---

## 3. Target Users

### 3.1 Farmers (Primary Users)

| Feature Access | Description |
|---------------|-------------|
| Soil Analysis | Input soil parameters and get AI-powered soil type classification |
| Crop Recommendations | Receive crop suggestions validated by both ML and agricultural rules |
| Product Shop | Browse and purchase seeds/products recommended for their soil |
| Cart & Orders | Place orders and track delivery status |
| Account Management | Register, login (email/password or Google OAuth), manage profile |

### 3.2 Admin Users

| Feature Access | Description |
|---------------|-------------|
| Admin Dashboard | Overview of system statistics (users, products, orders, revenue) |
| User Management | View, activate/deactivate, and manage all registered users |
| Product Management | CRUD operations for products (add, edit, delete seeds and crops) |
| Order Management | View all orders, update order statuses (pending → confirmed → shipped → delivered) |

### 3.3 Role-Based Access

| Route | Access Level |
|-------|-------------|
| `/` (Home) | Public — anyone |
| `/shop` | Public — anyone |
| `/login`, `/register` | Public — unauthenticated users |
| `/soil-analysis` | Protected — authenticated users only |
| `/cart`, `/my-orders` | Protected — authenticated users only |
| `/admin/*` | Admin only — users with `is_admin = True` |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                    │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  Home    │  │  Auth    │  │  Soil    │  │  Shop/Cart   │ │
│  │  Page    │  │  Page    │  │  Analysis│  │  /Orders     │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Admin Panel (Dashboard, Users,              │ │
│  │              Products, Orders)                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                          │ Axios API calls                    │
└──────────────────────────┼────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI + Python)                   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  Auth    │  │  Product │  │  Order   │  │  Prediction  │ │
│  │  API     │  │  API     │  │  API     │  │  API         │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
│                          │                                    │
│         ┌────────────────┼────────────────┐                  │
│         ▼                ▼                ▼                  │
│  ┌──────────┐  ┌──────────────────┐  ┌───────────────┐     │
│  │ SQLite   │  │  ML Service      │  │ Rule Engine   │     │
│  │ Database │  │  (scikit-learn)  │  │ (22 crops)    │     │
│  └──────────┘  └──────────────────┘  └───────────────┘     │
│                    │            │                             │
│         ┌──────────┴──────────┐                              │
│         ▼                     ▼                              │
│  ┌─────────────┐  ┌──────────────────┐                      │
│  │ Crop Model  │  │ Soil Model       │                      │
│  │ (RandomForest│  │ (RandomForest   │                      │
│  │  + Features) │  │  + Features)    │                      │
│  └─────────────┘  └──────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Technology Stack

### 5.1 Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.0 | UI library for building interactive components |
| **React Router DOM** | 6.22.0 | Client-side routing and navigation |
| **Vite** | 7.2.4 | Build tool and development server (fast HMR) |
| **Axios** | 1.6.5 | HTTP client for API communication |
| **@react-oauth/google** | 0.13.4 | Google OAuth 2.0 authentication integration |
| **Vanilla CSS** | — | Custom styling with animations, glassmorphism, dark mode |
| **ESLint** | 9.39.1 | Code linting and quality assurance |

### 5.2 Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.12 | Primary backend language |
| **FastAPI** | 0.104.1 | Modern, high-performance web framework with automatic API docs |
| **Uvicorn** | 0.24.0 | ASGI server for running FastAPI with hot-reload |
| **SQLAlchemy** | 2.0.23 | ORM (Object-Relational Mapping) for database operations |
| **Pydantic** | 2.5.0 | Data validation and serialization (request/response schemas) |
| **Pydantic-Settings** | 2.1.0 | Environment-based configuration management |
| **python-jose** | 3.3.0 | JWT (JSON Web Token) creation and verification |
| **passlib + bcrypt** | 1.7.4 / 3.2.2 | Secure password hashing |
| **email-validator** | 2.1.0 | Email format validation |

### 5.3 Machine Learning

| Technology | Purpose |
|-----------|---------|
| **scikit-learn** | ML model training, evaluation, and inference |
| **NumPy** | Numerical computations and array operations |
| **Pandas** | Data manipulation, feature engineering, dataset handling |
| **joblib** | Model serialization (save/load trained models) |

### 5.4 Database

| Technology | Purpose |
|-----------|---------|
| **SQLite** | Lightweight relational database (file: `agrisoil.db`) |

### 5.5 Authentication

| Technology | Purpose |
|-----------|---------|
| **JWT (JSON Web Tokens)** | Stateless authentication with token-based sessions |
| **bcrypt** | Secure one-way password hashing |
| **Google OAuth 2.0** | Social login via Google accounts |

---

## 6. Features & Functionalities

### 6.1 🔬 AI Soil Analysis (Core Feature)

**Page**: `/soil-analysis`

The crown jewel of the application. Users input 7 parameters:

| Parameter | Unit | Valid Range | Example |
|----------|------|-------------|---------|
| Nitrogen (N) | ppm | 0–300 | 50 |
| Phosphorus (P) | ppm | 5–300 | 25 |
| Potassium (K) | ppm | 5–400 | 50 |
| pH Level | — | 3.5–10.0 | 6.5 |
| Temperature | °C | 8–55 | 30 |
| Humidity | % | 14–100 | 65 |
| Rainfall | mm | 20–2000 | 150 |

**What happens on submission:**

1. Data is sent to the **Hybrid Analysis** endpoint (`/api/v1/model/hybrid-analyze`)
2. **Soil Classification Model** predicts the soil type (e.g., "Laterite", "Red Loam")
3. **Crop Recommendation Model** predicts the best crop (e.g., "Mango", "Rice")
4. **Rule Engine** validates the ML predictions against agricultural rules
5. If the ML-recommended crop fails validation (e.g., wrong soil type), the system **automatically selects the next best alternative** that passes rules
6. A **combined score** (60% ML + 40% Rules) is calculated
7. **Recommendation quality** is rated: Excellent / Good / Moderate / Fair / Poor
8. **Warnings** and **suggestions** are generated for suboptimal conditions
9. **Related products** (seeds/fertilizers) matching the recommended crop are fetched from the shop

### 6.2 🛒 E-commerce Shop

**Page**: `/shop`

- Browse agricultural products (seeds, crops, fertilizers)
- Filter by category
- Search functionality
- Product cards with images, prices, and stock availability
- "Add to Cart" button (requires authentication)
- After soil analysis, shows **related products** matching the recommended crop

### 6.3 🛍️ Cart & Checkout

**Page**: `/cart`

- View cart items with quantities
- Adjust quantities (increase/decrease)
- Remove items
- Calculate total amount
- Checkout with shipping address and phone number
- Place order

### 6.4 📦 Order Tracking

**Page**: `/my-orders`

- View all past orders with status
- Order status flow: `Pending → Confirmed → Processing → Shipped → Delivered`
- View order items and total amount
- Cancellation option for pending orders

### 6.5 🔐 Authentication

**Page**: `/login` and `/register` (unified `AuthPage`)

- **Email/Password Registration**: Full name, email, username, phone, password
- **Email/Password Login**: Email + password
- **Google OAuth Login**: One-click Google sign-in (auto-creates account if first time)
- Animated dual-panel UI with sliding transitions between Sign In and Sign Up
- JWT-based session management

### 6.6 👑 Admin Panel

**Pages**: `/admin/dashboard`, `/admin/users`, `/admin/products`, `/admin/orders`

| Panel | Features |
|-------|----------|
| **Dashboard** | Stats overview — total users, products, orders, revenue |
| **Users** | View all users, toggle active/inactive status, admin role management |
| **Products** | CRUD — create, read, update, delete products with images and pricing |
| **Orders** | View all orders, update status (pending → confirmed → shipped → delivered → cancelled) |

### 6.7 🏠 Landing Page (Home)

**Page**: `/`

- Hero section with animated gradient background
- Feature highlights (AI Analysis, Smart Recommendations, Hybrid Intelligence, Marketplace)
- Kerala soil types showcase (6 soil types with color visualization)
- Statistics: 95%+ accuracy, 11 soil types, 23 crops, 10K+ predictions
- Call-to-action buttons linking to soil analysis and shop

---

## 7. Machine Learning System

The ML system consists of **two trained models** that work in tandem:

### 7.1 Crop Recommendation Model

| Property | Details |
|----------|---------|
| **Purpose** | Predict the best crop for given soil and environmental conditions |
| **Algorithm** | RandomForest Classifier (with optional GradientBoosting fallback) |
| **Input Features** | 7 base + 11 engineered = **18 total features** |
| **Output** | Crop name (22 possible crops) + confidence scores for all classes |
| **Target Accuracy** | >85% |
| **Model File** | `backend/app/ml_models/crop_recommendation_model.joblib` |
| **Training Script** | `backend/train_enhanced_model.py` |

**Engineered Features for Crop Model:**
- Nutrient ratios: `N_P_ratio`, `N_K_ratio`, `P_K_ratio`
- `total_nutrients` (N + P + K)
- `nutrient_balance` (how balanced NPK are)
- Environmental stress indices: `temp_stress`, `humidity_stress`, `ph_stress`, `env_stress_index`
- Categorical: `rainfall_category` (6 bins), `ph_category` (4 bins)

### 7.2 Soil Classification Model

| Property | Details |
|----------|---------|
| **Purpose** | Classify soil type from NPK, pH, temperature, humidity, and rainfall |
| **Algorithm** | RandomForest Classifier (500 estimators, balanced class weights) |
| **Input Features** | 7 base + 15 engineered = **22 total features** |
| **Output** | Soil type (11 types) + probability distribution across all types |
| **Target** | >70% prediction confidence |
| **Model File** | `backend/app/ml_models/soil_classification_model.joblib` |
| **Training Script** | `backend/train_improved_soil_model.py` |

**Engineered Features for Soil Model (additional to crop model features):**
- `fertility_index` (weighted NPK score)
- `acidity_score` (derived from pH distance from neutral 7.0)
- Categorical: `humidity_category`, `rainfall_category`, `temp_category`
- Interaction features: `N_K_product`, `ph_humidity_ratio`, `rainfall_temp_ratio`

---

## 8. Datasets

### 8.1 Unified Agricultural Dataset (Crop Recommendation)

| Property | Details |
|----------|---------|
| **File** | `ml_model/datasets/combined/unified_agricultural_dataset.csv` |
| **Size** | ~10,500+ samples |
| **Crops** | 22 crops |
| **Features** | N, P, K, temperature, humidity, ph, rainfall, crop |
| **Generated by** | `backend/generate_dataset.py` |

**Crop Categories:**

| Category | Crops |
|----------|-------|
| **Cereals & Grains** | Rice (600 samples), Wheat (550), Maize (550) |
| **Pulses & Legumes** | Chickpea (450), Lentil (400), Kidneybeans (400), Pigeonpeas (400), Mothbeans (350), Mungbean (400), Blackgram (400) |
| **Fiber Crops** | Cotton (500), Jute (500) |
| **Fruits** | Mango (600), Banana (550), Papaya (500), Apple (450), Grapes (500), Orange (500), Pomegranate (450), Watermelon (400), Muskmelon (400) |
| **Plantation Crops** | Coffee (500), Coconut (500) |

**Generation Method**: Each crop has scientifically accurate ranges for all 7 parameters based on agricultural research. Samples are generated using **Gaussian distribution** centered at the midpoint of each range, with natural variation (±10–15% outside range bounds). This ensures the ML model learns correct crop-condition relationships.

### 8.2 Synthetic Soil Classification Dataset (Soil Classification)

| Property | Details |
|----------|---------|
| **File** | `ml_model/datasets/soil_classification/synthetic_soil_dataset.csv` |
| **Size** | ~10,500+ samples |
| **Soil Types** | 11 types (8 Kerala-specific + 3 generic) |
| **Features** | N, P, K, temperature, humidity, ph, rainfall, soil_type |
| **Generated by** | `backend/generate_soil_dataset.py` |
| **Data Source** | Kerala Agricultural University (KAU), Indian Council of Agricultural Research (ICAR), Soil Survey Organizations |

**Kerala Soil Types (8 types):**

| Soil Type | Samples | Key Characteristics | Where Found |
|-----------|---------|-------------------|-------------|
| **Laterite** | 2,000 | Acidic (pH 4.5–6.0), iron-rich, low P | Kannur, Kasaragod, Wayanad — 65% of Kerala |
| **Red Loam** | 1,500 | Slightly acidic (pH 5.5–6.8), fertile | Thrissur, Palakkad, Ernakulam |
| **Coastal Alluvial** | 1,200 | Alkaline (pH 7.0–8.5), salt influence | Alappuzha, Kollam coast |
| **Riverine Alluvial** | 1,300 | Near neutral (pH 6.2–7.5), high NPK, most fertile | Along Bharathapuzha, Periyar, Pamba rivers |
| **Brown Hydromorphic** | 1,100 | Very acidic (pH 4.0–5.5), waterlogged, high humidity | Kuttanad, Kole lands |
| **Forest Loam** | 1,000 | Slightly acidic (pH 5.0–6.5), very high N, cool temperatures | Wayanad, Idukki (Western Ghats) |
| **Black Cotton** | 700 | Alkaline (pH 7.0–8.5), high water retention, low humidity | Parts of Palakkad |
| **Peaty/Marshy** | 700 | Very acidic (pH 3.5–5.0), very high N, saturated | Kuttanad (below sea level) |

**Generic Soil Types (3 types):**

| Soil Type | Samples | Key Characteristics |
|-----------|---------|-------------------|
| **Loamy** | 400 | Balanced, neutral pH, good drainage |
| **Sandy** | 400 | Low nutrients, well-drained, low humidity |
| **Clayey** | 400 | High K, poor drainage, higher pH |

**Generation Method**: Same Gaussian distribution approach as the crop dataset. Each soil type has scientifically derived parameter ranges based on research data from KAU and ICAR. The Laterite type gets the most samples (2,000) because it covers 65% of Kerala's land area.

---

## 9. Algorithms & Models

### 9.1 Random Forest Classifier

**Used for**: Both Crop Recommendation and Soil Classification

**Why Random Forest?**
- **Ensemble Method**: Combines predictions from hundreds of decision trees, reducing overfitting
- **Handles Non-Linear Relationships**: Soil-crop relationships are inherently non-linear
- **Feature Importance**: Provides built-in feature importance scores, useful for understanding which parameters matter most
- **Probability Outputs**: Gives confidence scores (probabilities) for each class, essential for the hybrid system
- **Robust to Outliers**: Agricultural data naturally has outliers; RF handles them well

**Crop Model Configuration:**
```python
RandomForestClassifier(
    n_estimators=200-300,      # Number of trees (tuned via GridSearchCV)
    max_depth=20-30,           # tree depth (tuned)
    min_samples_split=2-5,     # tuned
    min_samples_leaf=1-2,      # tuned
    random_state=42,
    n_jobs=-1                  # parallel processing
)
```

**Soil Model Configuration:**
```python
RandomForestClassifier(
    n_estimators=500,           # More trees for higher confidence
    max_depth=25,
    min_samples_split=3,
    min_samples_leaf=1,
    class_weight='balanced',   # Handle class imbalance
    max_features='sqrt',
    random_state=42,
    n_jobs=-1
)
```

### 9.2 Gradient Boosting Classifier (Fallback)

**Used for**: Crop Recommendation (only if Random Forest accuracy < 90%)

```python
GradientBoostingClassifier(
    n_estimators=200,
    max_depth=10,
    learning_rate=0.1,
    random_state=42
)
```

### 9.3 Standard Scaler

**Used for**: Feature normalization before model prediction

Normalizes all features to have zero mean and unit variance, preventing features with larger scales (e.g., rainfall: 20–2000) from dominating features with smaller scales (e.g., pH: 3.5–10.0).

### 9.4 GridSearchCV (Hyperparameter Tuning)

**Used for**: Finding optimal Random Forest parameters

Performs **5-fold cross-validation** over a grid of hyperparameter combinations to find the best configuration. The grid explores:
- `n_estimators`: [200, 300]
- `max_depth`: [20, 30, None]
- `min_samples_split`: [2, 5]
- `min_samples_leaf`: [1, 2]

### 9.5 Cross-Validation (k=5)

**Used for**: Robust accuracy estimation

5-fold cross-validation splits training data into 5 parts, trains on 4 and tests on 1, rotating 5 times. This gives a more reliable accuracy estimate than a single train-test split.

### 9.6 Feature Engineering

**Purpose**: Transform raw 7 features into 18–22 enriched features

This is one of the most critical aspects of the ML pipeline. Domain knowledge is encoded into the features:

| Engineered Feature | Formula | Agricultural Meaning |
|-------------------|---------|---------------------|
| `N_P_ratio` | N / (P + 1) | Nitrogen-to-Phosphorus balance |
| `N_K_ratio` | N / (K + 1) | Nitrogen-to-Potassium balance |
| `P_K_ratio` | P / (K + 1) | Phosphorus-to-Potassium balance |
| `total_nutrients` | N + P + K | Overall soil fertility |
| `nutrient_balance` | 1 - deviation from equal NPK | How evenly distributed NPK are |
| `fertility_index` | 0.4N + 0.3P + 0.3K | Weighted fertility score |
| `temp_stress` | |temp - 25| / 25 | Distance from optimal temperature |
| `humidity_stress` | |humidity - 70| / 70 | Distance from optimal humidity |
| `ph_stress` | |pH - 6.5| / 6.5 | Distance from optimal pH |
| `env_stress_index` | Avg(temp, humidity, pH stress) | Overall environmental stress |
| `acidity_score` | (7.0 - pH) / 7.0 | Soil acidity indicator |
| `rainfall_category` | Binned rainfall | Rainfall intensity level |
| `ph_category` | Binned pH | Soil acidity level |
| `N_K_product` | N × K / 1000 | Interaction between N and K |
| `ph_humidity_ratio` | pH / (humidity/100 + 0.1) | pH adjusted for humidity |

### 9.7 Data Augmentation (SMOTE-like)

**Used for**: Balancing underrepresented soil types in the soil dataset

For soil types with fewer than 1,500 samples, the system generates additional synthetic samples by:
1. Resampling existing samples with replacement
2. Adding small Gaussian noise (5% of standard deviation)
3. Clipping values to valid ranges

---

## 10. Rule Engine (Domain Knowledge)

**File**: `backend/app/services/rule_engine.py`

The Rule Engine is a comprehensive knowledge base containing **agricultural rules for 22 crops**. Each crop has a `CropRule` dataclass with scientifically validated parameters:

### 10.1 Rule Parameters per Crop

| Parameter | Description | Example (Rice) |
|----------|-------------|----------------|
| `ph_min / ph_max` | Acceptable pH range | 5.0 – 8.0 |
| `ph_optimal_min / ph_optimal_max` | Optimal pH range | 5.5 – 6.5 |
| `preferred_soils` | Best soil types | Clayey, Loamy, Riverine Alluvial, Coastal Alluvial |
| `acceptable_soils` | Acceptable alternatives | Silty, Black Cotton |
| `min_rainfall / max_rainfall` | Acceptable rainfall (mm) | 150 – 300 |
| `optimal_rainfall_min / max` | Optimal rainfall | 180 – 250 |
| `min_temperature / max_temperature` | Acceptable temp (°C) | 20 – 40 |
| `optimal_temp_min / max` | Optimal temp | 22 – 32 |
| `nitrogen_need` | N requirement level | HIGH |
| `phosphorus_need` | P requirement level | MODERATE |
| `potassium_need` | K requirement level | MODERATE |
| `min_humidity / max_humidity` | Acceptable humidity (%) | 70 – 100 |

### 10.2 Validation Functions

The `RuleValidator` class provides 6 validation functions:

| Function | What it Validates | Scoring |
|----------|------------------|---------|
| `validate_ph()` | pH against crop's acceptable and optimal ranges | 1.0 (optimal), 0.7 (acceptable), 0.0 (fail) |
| `validate_soil_type()` | Soil type against preferred and acceptable lists | 1.0 (preferred), 0.7 (acceptable), 0.0 (fail) |
| `validate_rainfall()` | Rainfall against crop's water needs | 1.0 / 0.7 / 0.3 |
| `validate_temperature()` | Temperature against crop's thermal tolerance | 1.0 / 0.7 / 0.2 |
| `validate_humidity()` | Humidity against crop's moisture needs | 1.0 / 0.8 / 0.4 |
| `validate_nutrients()` | NPK levels against crop's nutrient requirements | 1.0 / 0.6 |

### 10.3 Crops with Rules (22 total)

Rice, Wheat, Maize, Cotton, Jute, Coffee, Banana, Mango, Apple, Grapes, Orange, Papaya, Coconut, Chickpea, Lentil, Pigeonpeas, Mothbeans, Mungbean, Blackgram, Kidneybeans, Pomegranate, Watermelon, Muskmelon

---

## 11. Hybrid Intelligence System

This is the **most important concept** in the project. Instead of blindly trusting ML predictions, the system uses a multi-step process:

### 11.1 The Hybrid Analysis Pipeline

```
User Input (7 parameters)
        │
        ▼
┌─── Step 1: ML Soil Classification ───┐
│   Random Forest → "Laterite" (92%)    │
└───────────────────────────────────────┘
        │
        ▼
┌─── Step 2: ML Crop Recommendation ───┐
│   Random Forest → "Rice" (85%)        │
│   Alternatives: "Jute" (8%), ...      │
└───────────────────────────────────────┘
        │
        ▼
┌─── Step 3: Rule Validation ──────────┐
│   Check "Rice" against rules:         │
│   ✅ pH: 5.5 is in range (5.0-8.0)   │
│   ❌ Soil: Laterite not in preferred  │
│      soils for Rice                    │
│   → FAILS SOIL CHECK                  │
└───────────────────────────────────────┘
        │
        ▼
┌─── Step 4: Rule-Filtered Selection ──┐
│   "Rice" failed → try "Jute"          │
│   ✅ Jute passes rules for Laterite   │
│   → SELECT "Jute" as recommendation   │
└───────────────────────────────────────┘
        │
        ▼
┌─── Step 5: Score Calculation ────────┐
│   Final Score = 60% × ML confidence   │
│              + 40% × Rule score       │
│              - 5% × each warning      │
└───────────────────────────────────────┘
        │
        ▼
┌─── Step 6: Quality Rating ───────────┐
│   Score ≥ 80 → "Excellent"            │
│   Score ≥ 70 → "Good"                 │
│   Score ≥ 50 → "Moderate"             │
│   Score ≥ 30 → "Fair"                 │
│   Score < 30 → "Poor"                 │
└───────────────────────────────────────┘
```

### 11.2 Why Hybrid?

| Approach | Strength | Weakness |
|----------|----------|----------|
| **ML Only** | Learns complex patterns from data | May predict crops unsuitable for the soil type |
| **Rules Only** | Guaranteed agricultural correctness | Limited to pre-defined rules, can't discover new patterns |
| **Hybrid (This Project)** | Best of both — ML discovers patterns, Rules validate correctness | More complex implementation |

### 11.3 Fallback Strategy

If no ML-predicted crop passes rule validation:
1. **Try**: Each ML alternative (sorted by confidence) → validate against rules
2. **Fallback**: If all ML crops fail → use `RuleValidator.get_suitable_crops()` to find the best rule-based crop for the conditions
3. **Last Resort**: If no rules match → use the original ML prediction with warnings

---

## 12. Authentication & Security

### 12.1 Email/Password Authentication
- Passwords hashed with **bcrypt** (72-byte limit enforced)
- JWT tokens with **HS256** algorithm
- Token expiry: **30 minutes**
- Tokens stored in `localStorage` on the frontend

### 12.2 Google OAuth 2.0
- Frontend: `@react-oauth/google` provides the Google login button
- Backend: Verifies Google ID token via `https://oauth2.googleapis.com/tokeninfo`
- Validates `aud` (audience) matches the app's Google Client ID
- Auto-creates a new user account if the Google email doesn't exist
- Generates a random password for Google-created accounts (they'll always use Google to sign in)

### 12.3 Route Protection
- **ProtectedRoute**: Redirects to `/login` if not authenticated
- **AdminRoute**: Redirects to `/` if not an admin user
- Backend: `get_current_active_user` dependency verifies JWT on protected endpoints

---

## 13. Database Design

**Database**: SQLite (`agrisoil.db`)

### 13.1 Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-increment primary key |
| email | String (Unique) | User's email address |
| username | String (Unique) | Display name |
| full_name | String (Nullable) | Full name |
| phone_number | String (Nullable) | Phone number |
| hashed_password | String | bcrypt-hashed password |
| is_active | Boolean | Account active status |
| is_admin | Boolean | Admin role flag |
| created_at | DateTime | Account creation timestamp |
| updated_at | DateTime | Last update timestamp |

### 13.2 Products Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-increment primary key |
| name | String | Product name |
| description | Text | Product description |
| category | String | Category (seeds, crops, etc.) |
| price | Float | Price in ₹ |
| stock_quantity | Integer | Available stock |
| image_url | String (Nullable) | Product image URL |
| is_available | Boolean | Availability toggle |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

### 13.3 Orders Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-increment primary key |
| user_id | Integer (FK → users.id) | Ordering user |
| total_amount | Float | Order total in ₹ |
| status | Enum | pending/confirmed/processing/shipped/delivered/cancelled |
| shipping_address | String | Delivery address |
| phone_number | String (Nullable) | Contact phone |
| notes | String (Nullable) | Order notes |
| created_at | DateTime | Order creation timestamp |
| updated_at | DateTime | Last update timestamp |

### 13.4 Order Items Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (PK) | Auto-increment primary key |
| order_id | Integer (FK → orders.id) | Parent order |
| product_id | Integer (FK → products.id) | Ordered product |
| quantity | Integer | Number of units |
| price | Float | Price at time of purchase |
| created_at | DateTime | Item creation timestamp |

---

## 14. API Endpoints

### 14.1 Authentication (`/api/v1/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login with email/password |
| POST | `/google` | Login/register with Google OAuth |
| GET | `/me` | Get current user info (JWT required) |

### 14.2 ML/Prediction (`/api/v1/model`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Crop recommendation (ML only) |
| POST | `/classify-soil` | Soil classification (ML only) |
| POST | `/analyze` | Combined soil + crop analysis (ML only) |
| POST | `/hybrid-analyze` | **Main endpoint** — Hybrid ML + Rules analysis |
| GET | `/model-status` | Check if models are loaded |

### 14.3 Products (`/api/v1/products`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all products (with pagination) |
| POST | `/` | Create product (admin only) |
| PUT | `/{id}` | Update product (admin only) |
| DELETE | `/{id}` | Delete product (admin only) |
| GET | `/search/by-crop/{crop_name}` | Find products matching a crop |
| POST | `/search/by-crops` | Find products matching multiple crops |

### 14.4 Orders (`/api/v1/orders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get my orders (authenticated user) |
| POST | `/` | Place a new order |
| GET | `/all` | Get all orders (admin only) |
| PATCH | `/{id}/status` | Update order status (admin only) |

### 14.5 Users (`/api/v1/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all users (admin only) |
| PATCH | `/{id}/toggle-active` | Activate/deactivate user (admin only) |

---

## 15. Frontend Pages & Components

### 15.1 Pages

| Page | File | Description |
|------|------|-------------|
| Home | `Home.jsx` | Landing page with hero, features, soil types showcase |
| Auth | `AuthPage.jsx` | Unified login/register with sliding panel animation |
| Soil Analysis | `SoilInput.jsx` | 7-parameter input form + analysis results display |
| Shop | `Shop.jsx` | Product listing with categories and search |
| Cart | `Cart.jsx` | Shopping cart with checkout functionality |
| My Orders | `MyOrders.jsx` | Order history and status tracking |
| Admin Dashboard | `admin/Dashboard.jsx` | Admin overview with stats |
| Admin Users | `admin/Users.jsx` | User management panel |
| Admin Products | `admin/Products.jsx` | Product CRUD panel |
| Admin Orders | `admin/Orders.jsx` | Order management panel |

### 15.2 Components

| Component | File | Description |
|-----------|------|-------------|
| Navbar | `Navbar.jsx` | Navigation bar with authentication-aware links, frosted glass effect |
| ProtectedRoute | `ProtectedRoute.jsx` | Redirects unauthenticated users to login |
| AdminRoute | `AdminRoute.jsx` | Restricts access to admin users only |

### 15.3 Services (API Layer)

| Service | File | Description |
|---------|------|-------------|
| authService | `authService.js` | Register, login, Google login, get current user |
| mlService | `mlService.js` | Predict crop, classify soil, analyze, hybrid analyze, model status |
| productService | `productService.js` | CRUD products, search by crop |
| orderService | `orderService.js` | Create order, get orders, update status |
| userService | `userService.js` | Admin user management |

### 15.4 Context

| Context | File | Description |
|---------|------|-------------|
| AuthContext | `AuthContext.jsx` | Global auth state (user, login, logout, googleLogin, register) |

---

## 16. Project Structure

```
AgriSoil AI/
├── backend/                          # Python FastAPI Backend
│   ├── app/
│   │   ├── api/v1/                   # API route handlers
│   │   │   ├── auth.py               # Authentication endpoints
│   │   │   ├── prediction.py         # ML prediction endpoints
│   │   │   ├── products.py           # Product CRUD endpoints
│   │   │   ├── orders.py             # Order management endpoints
│   │   │   └── users.py              # User management endpoints
│   │   ├── core/
│   │   │   ├── config.py             # App settings (JWT, DB, Google OAuth)
│   │   │   ├── database.py           # SQLAlchemy engine and session
│   │   │   └── security.py           # Password hashing and JWT utilities
│   │   ├── dependencies/
│   │   │   └── auth.py               # JWT verification dependency
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   └── order.py
│   │   ├── schemas/                  # Pydantic validation schemas
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   ├── order.py
│   │   │   └── prediction.py
│   │   ├── services/                 # Business logic
│   │   │   ├── auth.py               # Auth service (login, register)
│   │   │   ├── ml_service.py         # ML model loading and prediction
│   │   │   └── rule_engine.py        # Agricultural rule validation
│   │   ├── ml_models/                # Trained model files (.joblib)
│   │   │   ├── crop_recommendation_model.joblib
│   │   │   ├── soil_classification_model.joblib
│   │   │   └── soil_model_metadata.json
│   │   └── main.py                   # FastAPI app entry point
│   ├── generate_dataset.py           # Crop dataset generator
│   ├── generate_soil_dataset.py      # Soil dataset generator
│   ├── train_enhanced_model.py       # Crop model training
│   ├── train_improved_soil_model.py  # Soil model training
│   ├── create_admin.py               # Admin user creation script
│   ├── requirements.txt              # Python dependencies
│   └── agrisoil.db                   # SQLite database file
│
├── frontend/                         # React + Vite Frontend
│   ├── src/
│   │   ├── pages/                    # Page components
│   │   │   ├── Home.jsx / Home.css
│   │   │   ├── AuthPage.jsx / Auth.css
│   │   │   ├── SoilInput.jsx / SoilInput.css
│   │   │   ├── Shop.jsx / Shop.css
│   │   │   ├── Cart.jsx / Cart.css
│   │   │   ├── MyOrders.jsx / MyOrders.css
│   │   │   └── admin/                # Admin pages
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Products.jsx
│   │   │       ├── Orders.jsx
│   │   │       └── Users.jsx
│   │   ├── components/               # Reusable components
│   │   │   ├── Navbar.jsx / Navbar.css
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── services/                 # API service modules
│   │   │   ├── authService.js
│   │   │   ├── mlService.js
│   │   │   ├── productService.js
│   │   │   ├── orderService.js
│   │   │   └── userService.js
│   │   ├── context/AuthContext.jsx    # Auth state management
│   │   ├── config/api.js             # Axios instance configuration
│   │   ├── utils/validation.js       # Input validation utilities
│   │   ├── App.jsx                   # Root component with routing
│   │   └── main.jsx                  # Entry point (Google OAuth wrapper)
│   └── package.json
│
├── ml_model/                         # ML training artifacts
│   ├── datasets/
│   │   ├── combined/                 # Crop recommendation dataset
│   │   │   └── unified_agricultural_dataset.csv
│   │   └── soil_classification/      # Soil classification dataset
│   │       └── synthetic_soil_dataset.csv
│   ├── models/                       # Alternative model storage
│   └── train_soil_model.py           # Basic soil model training
│
└── docs/                             # Documentation
```

---

## 17. How It All Works Together

### End-to-End User Flow

```
1. LANDING
   User visits AgroNova → sees hero section, features, soil types
   → clicks "Start Soil Analysis"

2. AUTHENTICATION
   Redirected to /login (protected route)
   → Signs in with email/password OR Google OAuth
   → JWT stored in localStorage
   → Redirected back to /soil-analysis

3. SOIL ANALYSIS
   User enters 7 parameters (N, P, K, pH, temp, humidity, rainfall)
   → Frontend validates ranges
   → Sends POST to /api/v1/model/hybrid-analyze

4. BACKEND PROCESSING
   a) ML Soil Classification → "Laterite" (92% confidence)
   b) ML Crop Recommendation → "Coconut" (78% confidence)
   c) Rule Validation → Check "Coconut" for Laterite soil
      - pH: ✅ 5.2 in range (5.0-8.0)
      - Soil: ✅ Laterite is preferred for Coconut
      - All checks: ✅ PASSED
   d) Score = 60% × 78 + 40% × 95 = 84.8 → "Excellent"

5. RESULTS DISPLAYED
   User sees:
   - Soil type: Laterite (92% confidence)
   - Recommended crop: Coconut (Excellent quality)
   - Warnings: None
   - Suggestions: Minor improvements
   - Alternative crops: Coffee, Mango, Banana
   - Related products: Coconut seedlings, fertilizers

6. SHOPPING
   User clicks "View Products" → sees coconut seeds in shop
   → Adds to cart → Proceeds to checkout
   → Enters shipping address → Places order

7. ORDER TRACKING
   User visits /my-orders → sees order status: "Pending"
   Admin updates status: Pending → Confirmed → Shipped → Delivered

8. ADMIN OPERATIONS
   Admin logs in → Dashboard shows stats
   → Manages products (add new seeds)
   → Updates order statuses
   → Manages user accounts
```

---

## Summary

**AgriSoil AI** is a comprehensive agricultural intelligence platform that bridges the gap between modern AI technology and traditional farming wisdom. By combining **machine learning models** trained on 10,000+ scientifically generated samples with a **rule engine** encoding agricultural knowledge for 22 crops and 11 soil types, it delivers recommendations that are both **data-driven** and **agriculturally sound** — specifically tailored for Kerala's unique agricultural landscape.

The **hybrid approach** (60% ML + 40% Rules) with automatic fallback ensures that farmers always receive actionable, validated crop recommendations, along with the ability to purchase the right seeds and products directly through the integrated e-commerce platform.

---

*© 2026 AgroNova AI. Built with ❤️ for farmers.*
