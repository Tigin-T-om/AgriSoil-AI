# 🌱 AgriSoil AI — Complete Project Documentation

> **An AI-powered agricultural intelligence platform that combines machine learning with domain-specific rules to deliver accurate soil analysis, smart crop recommendations, and an integrated e-commerce marketplace with Razorpay payments, delivery staff management, drainage-aware predictions, and structured address-based order fulfillment — specifically tailored for Kerala, India.**

---

## 📋 Table of Contents

1. [Project Purpose & Vision](#1-project-purpose--vision)
2. [Market Importance & Real-World Impact](#2-market-importance--real-world-impact)
3. [Problem Statement & Goal](#3-problem-statement--goal)
4. [Target Users & Role-Based Access](#4-target-users--role-based-access)
5. [System Architecture](#5-system-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Features & Functionalities](#7-features--functionalities)
8. [Machine Learning System](#8-machine-learning-system)
9. [Datasets](#9-datasets)
10. [Algorithms & Models](#10-algorithms--models)
11. [Rule Engine (Domain Knowledge)](#11-rule-engine-domain-knowledge)
12. [Hybrid Intelligence System](#12-hybrid-intelligence-system)
13. [Authentication & Security](#13-authentication--security)
14. [Database Design](#14-database-design)
15. [API Endpoints](#15-api-endpoints)
16. [Frontend Pages & Components](#16-frontend-pages--components)
17. [Project Structure](#17-project-structure)
18. [How It All Works Together](#18-how-it-all-works-together)
19. [Version History](#19-version-history)

---

## 1. Project Purpose & Vision

### Why We Built This Project

**AgriSoil AI** was created to solve a critical gap in India's agricultural sector — bringing the power of **Artificial Intelligence** directly to farmers who traditionally rely on intuition, outdated advice, or expensive lab tests to make crop and soil decisions.

The project serves as a **proof of concept** and **working prototype** demonstrating how AI can be practically applied to agriculture, specifically targeting **Kerala, India** — a state with unique agro-climatic diversity including 8+ distinct soil types, tropical monsoon patterns, and 23+ viable crop varieties.

### Core Vision

> *Democratize access to intelligent agricultural analysis by giving every farmer — regardless of education or economic background — the same quality of soil and crop guidance that was previously only available through expensive consultants and laboratory testing.*

### What Makes This Project Unique

| Aspect | Traditional Approach | AgriSoil AI Approach |
|--------|---------------------|---------------------|
| **Soil Analysis** | Send samples to a lab (₹500-2000, 7-14 days) | Instant AI classification from 7 parameters (free) |
| **Crop Selection** | Ask local elders or agricultural officers | ML model trained on 10,000+ scientifically generated samples |
| **Validation** | Trust a single source blindly | **Hybrid system** — ML predictions validated by agricultural rules |
| **Product Purchase** | Visit multiple seed shops | Integrated marketplace linked to recommendations |
| **Drainage Awareness** | Manual observation | AI-powered drainage/waterlogging risk assessment |
| **End-to-End Flow** | Visit 3-4 different places | Single platform: Analyze → Recommend → Purchase → Deliver |

---

## 2. Market Importance & Real-World Impact

### 2.1 India's Agricultural Context (2026)

| Statistic | Value |
|-----------|-------|
| **Agriculture's GDP Contribution** | ~17% of India's GDP |
| **Farming Population** | ~58% of India's population depends on agriculture |
| **Small/Marginal Farmers** | 86% of all farmers have < 2 hectares |
| **Annual Crop Loss due to wrong selection** | Estimated ₹50,000+ crore |
| **Soil Testing Penetration** | Only ~30% of farmers have had their soil tested |

### 2.2 Why AI in Agriculture Matters Now

1. **Digital India Growth**: Internet penetration in rural India has crossed 50%, making web-based tools accessible to farmers for the first time.
2. **Climate Uncertainty**: Changing monsoon patterns require data-driven decision making over traditional knowledge.
3. **Food Security**: India needs to feed 1.4 billion people; optimized crop selection directly impacts food production.
4. **Government Push**: Programs like e-NAM, AgriStack, and Digital Agriculture Mission actively promote tech adoption.
5. **Kerala's Unique Challenge**: With 8+ distinct soil types in a small geographic area, one-size-fits-all advice fails — localized AI is critical.

### 2.3 Competitive Advantage

| Feature | Other AgriTech Apps | AgriSoil AI |
|---------|-------------------|-------------|
| Soil Type Detection | ❌ Require lab results | ✅ AI from 7 parameters |
| Drainage/Waterlogging Risk | ❌ Not considered | ✅ Built-in drainage validation |
| Crop Probability Distribution | ❌ Single recommendation | ✅ Shows top 6 crops with % |
| Rule Validation | ❌ Pure ML (may give wrong crops) | ✅ Hybrid ML + Domain Rules |
| Kerala-Specific Soil Types | ❌ Generic soil classes | ✅ 8 Kerala-specific types |
| Integrated Marketplace | ❌ Separate apps | ✅ Buy seeds directly from results |
| Delivery Management | ❌ Basic shipping | ✅ District-based staff auto-assign |

### 2.4 Real-World Impact

- **Reduces crop failure risk** by validating ML predictions against scientific rules
- **Saves farmers ₹500-2000** per soil test by providing instant AI analysis
- **Improves yield potential** by matching crops accurately to soil conditions
- **Supports local commerce** through the integrated marketplace
- **Creates employment** through the delivery staff management system

---

## 3. Problem Statement & Goal

### The Problem

Farmers in Kerala face several challenges:

- **Diverse Soil Types**: Kerala has 8+ distinct soil types (Laterite, Riverine Alluvial, Forest Loam, etc.), each requiring different crop strategies.
- **Lack of Soil Testing Access**: Professional soil analysis is expensive (₹500-2000) and takes 7-14 days.
- **Incorrect Crop Selection**: Choosing the wrong crop leads to poor yields, wasted resources, and financial loss.
- **Waterlogging Risk**: Kerala's high rainfall (2000-3000mm annually) makes drainage assessment critical for crops like Banana and Mango that are waterlogging-sensitive.
- **No Unified Platform**: Farmers must visit labs, advisors, and seed shops separately.

### The Goal

Build an **all-in-one AI-powered platform** that:

1. **Accepts 8 soil/environmental parameters** (N, P, K, pH, Temperature, Humidity, Rainfall, Drainage)
2. **Classifies the soil type** using a trained ML model (11 types, 97.6% accuracy)
3. **Recommends the best crop** validated by agricultural rules for 23 crops
4. **Provides probability distributions** for both soil types and crop matches
5. **Assesses drainage/waterlogging risk** for sensitive crops
6. **Suggests related products** that the farmer can purchase directly
7. **Manages the entire workflow**: analysis → recommendation → purchase → delivery

---

## 4. Target Users & Role-Based Access

### 4.1 Farmers (Primary Users)

| Feature | Description |
|---------|-------------|
| Soil Analysis | Input 8 parameters including drainage; get AI-powered classification |
| Crop Recommendations | Receive validated recommendations with probability distributions |
| Crop Probabilities | View top 6 crop matches with percentage confidence |
| Soil Probabilities | View top 6 soil type matches with percentage confidence |
| Product Shop | Browse and purchase seeds/products recommended for their soil |
| Cart & Orders | Place orders with structured addresses and Razorpay payments |
| Account | Register, login (email/password or Google OAuth), manage profile |

### 4.2 Admin Users

| Feature | Description |
|---------|-------------|
| Dashboard | Overview with Recharts analytics — revenue, order distribution, top products |
| User Management | View, activate/deactivate, manage registered users |
| Product Management | Full CRUD for products (seeds, crops, fertilizers) |
| Order Management | View orders with full addresses, update statuses, assign delivery staff |
| Delivery Staff | Manage staff, toggle availability, monitor workload, auto-assign by district |

### 4.3 Delivery Staff

| Feature | Description |
|---------|-------------|
| Delivery Login | Separate JWT-based authentication at `/delivery/login` |
| Dashboard | View assigned orders with full customer details |
| Status Updates | Mark orders as Shipped → Delivered |
| Profile | Update service district, phone number, availability status |

### 4.4 Role-Based Routes

| Route | Access Level |
|-------|-------------|
| `/` (Home) | Public |
| `/shop`, `/product/:id` | Public |
| `/soil-analysis` | Public (no login required) |
| `/terms`, `/privacy` | Public |
| `/login`, `/register` | Public (unauthenticated users) |
| `/cart`, `/my-orders` | Protected (authenticated users) |
| `/admin/*` | Admin only (`is_admin = True`) |
| `/delivery/*` | Delivery staff only (separate JWT) |

---

## 5. System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19 + Vite 7)                │
│                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Home    │  │  Auth    │  │  Soil    │  │  Shop/Cart   │  │
│  │  Page    │  │  Page    │  │  Analysis│  │  /Orders     │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
│  ┌────────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │  Admin Panel   │  │ Delivery Panel│  │ Legal Pages     │  │
│  │  (5 pages)     │  │ (Login+Dash)  │  │ (Terms/Privacy) │  │
│  └────────────────┘  └───────────────┘  └─────────────────┘  │
│                          │ Axios API calls                     │
└──────────────────────────┼─────────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI + Python 3.12)                │
│                                                                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ ┌─────────┐  │
│  │ Auth   │ │Product │ │ Order  │ │Prediction│ │Delivery │  │
│  │ API    │ │ API    │ │ API    │ │ API      │ │Staff API│  │
│  └────────┘ └────────┘ └────────┘ └──────────┘ └─────────┘  │
│  ┌─────────────┐                                              │
│  │ Payment API │ (Razorpay Integration)                       │
│  └─────────────┘                                              │
│                          │                                     │
│         ┌────────────────┼────────────────┐                   │
│         ▼                ▼                ▼                   │
│  ┌──────────┐  ┌──────────────────┐  ┌───────────────┐      │
│  │ SQLite   │  │  ML Service      │  │ Rule Engine   │      │
│  │ Database │  │  (scikit-learn)  │  │ (23 crops +   │      │
│  └──────────┘  └──────────────────┘  │  drainage)    │      │
│                    │            │     └───────────────┘      │
│         ┌──────────┴──────────┐                               │
│         ▼                     ▼                               │
│  ┌─────────────┐  ┌──────────────────┐                       │
│  │ Crop Model  │  │ Soil Model       │                       │
│  │ (97.6% acc) │  │ (11 types)       │                       │
│  │ 18 features │  │ 22 features      │                       │
│  └─────────────┘  └──────────────────┘                       │
└───────────────────────────────────────────────────────────────┘
```

---

## 6. Technology Stack

### 6.1 Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.0 | UI library for interactive components |
| **React Router DOM** | 6.22.0 | Client-side routing (20+ routes) |
| **Vite** | 7.2.4 | Build tool with fast HMR |
| **Axios** | 1.6.5 | HTTP client for API communication |
| **Recharts** | 2.x | Admin dashboard analytics charts |
| **@react-oauth/google** | 0.13.4 | Google OAuth 2.0 integration |
| **Vanilla CSS** | — | Custom dark theme with animations and glassmorphism |

### 6.2 Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.12 | Primary backend language |
| **FastAPI** | 0.104.1 | High-performance web framework with auto API docs |
| **Uvicorn** | 0.24.0 | ASGI server with hot-reload |
| **SQLAlchemy** | 2.0.23 | ORM for database operations |
| **Pydantic** | 2.5.0 | Data validation and serialization |
| **python-jose** | 3.3.0 | JWT creation and verification |
| **passlib + bcrypt** | 1.7.4 | Secure password hashing |
| **razorpay** | — | Payment gateway SDK |

### 6.3 Machine Learning

| Technology | Purpose |
|-----------|---------|
| **scikit-learn** | Model training, evaluation, inference |
| **NumPy** | Numerical computations |
| **Pandas** | Data manipulation and feature engineering |
| **joblib** | Model serialization (save/load) |

### 6.4 Database & Auth

| Technology | Purpose |
|-----------|---------|
| **SQLite** | Lightweight relational database (`agrisoil.db`) |
| **JWT** | Stateless authentication (users + delivery staff) |
| **bcrypt** | One-way password hashing |
| **Google OAuth 2.0** | Social login |
| **Razorpay + HMAC SHA256** | Payment processing and verification |

---

## 7. Features & Functionalities

### 7.1 🔬 AI Soil Analysis (Core Feature)

**Page**: `/soil-analysis` — **No login required**

Users input 8 parameters:

| Parameter | Unit | Range | Example |
|----------|------|-------|---------|
| Nitrogen (N) | ppm | 0–1000 | 60 |
| Phosphorus (P) | ppm | 0–300 | 35 |
| Potassium (K) | ppm | 0–650 | 60 |
| pH Level | — | 3.0–9.5 | 6.5 |
| Temperature | °C | 18–40 | 30 |
| Humidity | % | 30–100 | 60 |
| Rainfall (Annual) | mm | 1000–6000 | 1700 |
| **Drainage** | — | Poor/Moderate/Good/Excellent | Good |

**What happens on submission:**

1. Data sent to **Hybrid Analysis** endpoint
2. **Soil Classification Model** predicts soil type with probability distribution
3. **Crop Recommendation Model** predicts best crop with all crop probabilities
4. **Rule Engine** validates ML predictions against agricultural rules (including drainage)
5. If ML crop fails validation, system **auto-selects the next best alternative**
6. **Combined score** calculated (60% ML + 40% Rules)
7. **Quality rating**: Excellent / Good / Moderate / Fair / Poor
8. **Drainage warnings** generated for waterlogging-sensitive crops
9. **Related products** fetched from the marketplace (only for the recommended crop)

**Results Display:**
- Overall score with quality badge
- Detected soil type with confidence percentage
- Recommended crop with match percentage
- Validation scores breakdown (ML, Rule, Final)
- **Insights & Suggestions** with actionable advice
- **Soil Type Probabilities** — top 6 with percentage bars
- **Crop Probabilities** — top 6 with percentage bars
- **Recommended Products** linked to the predicted crop

### 7.2 🛒 E-commerce Shop

**Page**: `/shop` and `/product/:id`

- Browse products (seeds, crops, fertilizers, tools)
- Filter by category, search by name
- Product detail page with full descriptions
- "Add to Cart" (requires login)
- Products linked to soil analysis recommendations

### 7.3 🛍️ Cart & Checkout (Razorpay)

**Page**: `/cart`

- Cart management (add/remove, adjust quantities)
- Real-time stock validation
- **Structured Address Form**: House/Flat, Landmark, City, District (Kerala dropdown), State, Pincode, Phone, Notes
- **Razorpay Payment Flow**: Create order → Checkout popup → Verify signature → Confirm order
- Free shipping above ₹500

### 7.4 📦 Order Tracking

**Page**: `/my-orders`

- Order history with status tracking
- Status flow: `Pending → Confirmed → Processing → Shipped → Delivered`
- Cancellation for pending orders

### 7.5 🔐 Authentication

**Page**: `/login` and `/register` (unified `AuthPage` with sliding panel)

- Email/Password registration and login
- Google OAuth one-click sign-in
- JWT-based sessions (30-minute expiry)
- Terms of Service and Privacy Policy agreement on registration

### 7.6 👑 Admin Panel

**Pages**: `/admin/dashboard`, `/admin/users`, `/admin/products`, `/admin/orders`, `/admin/delivery`

| Panel | Features |
|-------|----------|
| Dashboard | Recharts analytics — revenue chart, order status pie, top products bar |
| Users | View all, toggle active/inactive, admin role management |
| Products | Full CRUD with images and pricing |
| Orders | Full address details, status updates, delivery staff assign/auto-assign/unassign |
| Delivery Staff | View all staff, monitor workload, toggle availability |

### 7.7 🚚 Delivery Staff Panel

**Pages**: `/delivery/login`, `/delivery/dashboard`

- Separate JWT authentication
- Profile card with order statistics
- Full customer details per order (name, phone, address, landmark, city, district, pincode)
- Status updates: Shipped → Delivered
- Profile editing (district, phone, availability)

### 7.8 🏠 Landing Page

**Page**: `/`

- Side-by-side hero layout: text content (left) + farmer sunset image (right)
- "Powered by AI • Hybrid Intelligence" badge
- Feature highlights (4 feature cards)
- Kerala soil types showcase (6 types with color swatches)
- Statistics: AI Powered, 11 Soil Types, 23 Crops, 10K+ Predictions
- CTA buttons linking to soil analysis and shop

### 7.9 📄 Legal Pages

**Pages**: `/terms` and `/privacy`

- **Terms of Service**: 9 sections covering acceptance, service description, user accounts, AI disclaimer, marketplace, IP, liability, modifications, contact
- **Privacy Policy**: 10 sections covering data collection, usage, storage, soil data handling, cookies, third-party services, user rights, retention, changes, contact
- All links throughout the app (footer, registration) properly navigate to these pages

---

## 8. Machine Learning System

### 8.1 Crop Recommendation Model

| Property | Details |
|----------|---------|
| **Algorithm** | RandomForest Classifier |
| **Input Features** | 7 base + 11 engineered = **18 total** |
| **Output** | Crop name (23 crops) + probability distribution |
| **Accuracy** | **97.6%** |
| **Model File** | `backend/app/ml_models/crop_recommendation_model.joblib` |

### 8.2 Soil Classification Model

| Property | Details |
|----------|---------|
| **Algorithm** | RandomForest Classifier (500 estimators, balanced weights) |
| **Input Features** | 7 base + 15 engineered = **22 total** |
| **Output** | Soil type (11 types) + probability distribution |
| **Model File** | `backend/app/ml_models/soil_classification_model.joblib` |

### 8.3 Engineered Features

| Feature | Formula | Agricultural Meaning |
|---------|---------|---------------------|
| `N_P_ratio` | N / (P + 1) | Nitrogen-Phosphorus balance |
| `N_K_ratio` | N / (K + 1) | Nitrogen-Potassium balance |
| `P_K_ratio` | P / (K + 1) | Phosphorus-Potassium balance |
| `total_nutrients` | N + P + K | Overall soil fertility |
| `nutrient_balance` | 1 - deviation | NPK distribution evenness |
| `fertility_index` | 0.4N + 0.3P + 0.3K | Weighted fertility score |
| `temp_stress` | \|temp - 25\| / 25 | Temperature deviation |
| `humidity_stress` | \|humidity - 70\| / 70 | Humidity deviation |
| `ph_stress` | \|pH - 6.5\| / 6.5 | pH deviation |
| `env_stress_index` | Avg of stress indices | Overall environmental stress |
| `rainfall_category` | Binned rainfall | Rainfall intensity level |
| `ph_category` | Binned pH | Acidity level |

---

## 9. Datasets

### 9.1 Crop Dataset (~10,500+ samples, 23 crops)

| Category | Crops |
|----------|-------|
| Cereals & Grains | Rice, Wheat, Maize |
| Pulses & Legumes | Chickpea, Lentil, Kidneybeans, Pigeonpeas, Mothbeans, Mungbean, Blackgram |
| Fiber Crops | Cotton, Jute |
| Fruits | Mango, Banana, Papaya, Apple, Grapes, Orange, Pomegranate, Watermelon, Muskmelon |
| Plantation | Coffee, Coconut |

### 9.2 Soil Dataset (~10,500+ samples, 11 types)

**Kerala-Specific (8 types):**

| Soil Type | Samples | Key Characteristics |
|-----------|---------|-------------------|
| Laterite | 2,000 | Acidic, iron-rich (65% of Kerala) |
| Red Loam | 1,500 | Slightly acidic, fertile |
| Coastal Alluvial | 1,200 | Alkaline, salt influence |
| Riverine Alluvial | 1,300 | Near neutral, highest NPK |
| Brown Hydromorphic | 1,100 | Very acidic, waterlogged |
| Forest Loam | 1,000 | Acidic, high organic matter |
| Black Cotton | 700 | Alkaline, high water retention |
| Peaty/Marshy | 700 | Very acidic, saturated |

**Generic (3 types):** Loamy (400), Sandy (400), Clayey (400)

---

## 10. Algorithms & Models

### 10.1 Random Forest Classifier

**Why Random Forest?**
- Ensemble of hundreds of decision trees → reduces overfitting
- Handles non-linear soil-crop relationships
- Provides probability outputs for confidence scoring
- Built-in feature importance
- Robust to outliers in agricultural data

### 10.2 Supporting Techniques

| Technique | Purpose |
|-----------|---------|
| StandardScaler | Feature normalization (prevent scale dominance) |
| GridSearchCV | Hyperparameter tuning (5-fold cross-validation) |
| SMOTE-like Augmentation | Balance underrepresented soil types |
| Feature Engineering | Transform 7 raw features → 18-22 enriched features |

---

## 11. Rule Engine (Domain Knowledge)

**File**: `backend/app/services/rule_engine.py`

Contains **agricultural rules for 23 crops** with scientifically validated parameters.

### 11.1 Rule Parameters per Crop

| Parameter | Description |
|----------|-------------|
| pH range (acceptable + optimal) | Soil acidity tolerance |
| Preferred & acceptable soils | Soil type compatibility |
| Rainfall range (acceptable + optimal) | Water requirements (annual mm) |
| Temperature range (acceptable + optimal) | Thermal tolerance |
| NPK requirements | Nutrient level needs (High/Moderate/Low) |
| Humidity range | Moisture requirements |
| **Drainage need** | Required drainage level (Poor/Moderate/Good/Excellent) |
| **Waterlogging sensitivity** | Whether crop is sensitive to waterlogging |

### 11.2 Validation Functions (7 total)

| Function | Scoring |
|----------|---------|
| `validate_ph()` | 1.0 (optimal) / 0.7 (acceptable) / 0.0 (fail) |
| `validate_soil_type()` | 1.0 (preferred) / 0.7 (acceptable) / 0.0 (fail) |
| `validate_rainfall()` | 1.0 / 0.7 / 0.3 |
| `validate_temperature()` | 1.0 / 0.7 / 0.2 |
| `validate_humidity()` | 1.0 / 0.8 / 0.4 |
| `validate_nutrients()` | 1.0 / 0.6 |
| **`validate_drainage()`** | 1.0 (suitable) / 0.5 (suboptimal) / 0.0 (critical fail) |

### 11.3 Drainage-Aware Crops

| Crop | Drainage Behavior |
|------|------------------|
| **Rice** | Prefers **Poor** drainage (waterlogged/flooded conditions) |
| **Banana** | **Waterlogging sensitive** — Poor drainage triggers critical warning |
| **Mango** | **Waterlogging sensitive** — Needs well-drained soil |

---

## 12. Hybrid Intelligence System

### 12.1 Pipeline

```
User Input (8 parameters including drainage)
        │
        ▼
┌─── Step 1: ML Soil Classification ───┐
│   Random Forest → "Laterite" (92%)    │
└───────────────────────────────────────┘
        │
        ▼
┌─── Step 2: ML Crop Recommendation ───┐
│   Random Forest → "Rice" (85%)        │
│   + All crop probabilities             │
└───────────────────────────────────────┘
        │
        ▼
┌─── Step 3: Rule Validation (7 checks)─┐
│   pH ✅, Soil ❌, Rainfall ✅,         │
│   Temp ✅, Humidity ✅, Nutrients ✅,  │
│   Drainage ✅                          │
│   → FAILS SOIL CHECK → try next       │
└───────────────────────────────────────┘
        │
        ▼
┌─── Step 4: Auto-Select Best Crop ────┐
│   Try alternatives by ML confidence   │
│   → Find crop passing ALL rules       │
└───────────────────────────────────────┘
        │
        ▼
┌─── Step 5: Score & Quality Rating ───┐
│   Final = 60% ML + 40% Rules - 5%/warn│
│   ≥80 Excellent, ≥70 Good, ≥50 Moderate│
└───────────────────────────────────────┘
```

### 12.2 Why Hybrid?

| Approach | Strength | Weakness |
|----------|----------|----------|
| ML Only | Learns complex patterns | May predict unsuitable crops |
| Rules Only | Guaranteed correctness | Can't discover new patterns |
| **Hybrid** | Best of both | More complex (worth it) |

---

## 13. Authentication & Security

| Feature | Implementation |
|---------|---------------|
| Password Hashing | bcrypt (72-byte limit) |
| JWT Tokens | HS256, 30-minute expiry |
| Google OAuth | ID token verification via Google API |
| Route Protection | ProtectedRoute, AdminRoute, DeliveryRoute components |
| Payment Security | Razorpay HMAC SHA256 signature verification |

---

## 14. Database Design

**Database**: SQLite (`agrisoil.db`)

### Tables

| Table | Key Columns |
|-------|-------------|
| **Users** | id, email, username, full_name, phone, hashed_password, is_admin, is_active |
| **Products** | id, name, description, category, price, stock_quantity, image_url, is_available |
| **Orders** | id, user_id, total_amount, status, shipping_address, city, district, state, pincode, landmark, phone_number, notes, delivery_staff_id, payment_status, razorpay_order_id/payment_id/signature |
| **Order Items** | id, order_id, product_id, quantity, price |
| **Delivery Staff** | id, username, email, full_name, hashed_password, phone, district, is_available, is_active |

---

## 15. API Endpoints

| Group | Endpoints | Auth |
|-------|-----------|------|
| **Auth** (`/api/v1/auth`) | register, login, google, me | Public / JWT |
| **ML** (`/api/v1/model`) | predict, classify-soil, analyze, **hybrid-analyze**, model-status | Public |
| **Products** (`/api/v1/products`) | CRUD, search/by-crop, search/by-crops | Public / Admin |
| **Orders** (`/api/v1/orders`) | create, list (my/all), update status | JWT / Admin |
| **Payment** (`/api/v1/payment`) | create-order, verify-payment | JWT |
| **Users** (`/api/v1/users`) | list, toggle-active | Admin |
| **Delivery** (`/api/v1/delivery`) | login, me, my-orders, status update, list, create, assign/auto-assign/unassign | Delivery JWT / Admin |

---

## 16. Frontend Pages & Components

### 16.1 Pages (22 total)

| Page | File | Access |
|------|------|--------|
| Home | `Home.jsx` | Public |
| Auth (Login/Register) | `AuthPage.jsx` | Public |
| Standalone Login | `Login.jsx` | Public |
| Standalone Register | `Register.jsx` | Public |
| Forgot Password | `ForgotPassword.jsx` | Public |
| Twitter Callback | `TwitterCallback.jsx` | Public |
| **Terms of Service** | `TermsOfService.jsx` | Public |
| **Privacy Policy** | `PrivacyPolicy.jsx` | Public |
| Soil Analysis | `SoilInput.jsx` | Public |
| Shop | `Shop.jsx` | Public |
| Product Detail | `ProductDetail.jsx` | Public |
| Cart | `Cart.jsx` | Protected |
| My Orders | `MyOrders.jsx` | Protected |
| Admin Dashboard | `admin/Dashboard.jsx` | Admin |
| Admin Users | `admin/Users.jsx` | Admin |
| Admin Products | `admin/Products.jsx` | Admin |
| Admin Orders | `admin/Orders.jsx` | Admin |
| Admin Delivery | `admin/DeliveryManage.jsx` | Admin |
| Delivery Login | `delivery/DeliveryLogin.jsx` | Public |
| Delivery Dashboard | `delivery/DeliveryDashboard.jsx` | Delivery Staff |

### 16.2 Components

| Component | Purpose |
|-----------|---------|
| Navbar | Auth-aware navigation with frosted glass effect |
| ProtectedRoute | Redirect unauthenticated users |
| AdminRoute | Restrict to admin users |
| DeliveryRoute | Restrict to delivery staff |

### 16.3 Services (7 API modules)

authService, mlService, productService, orderService, paymentService, userService, deliveryService

---

## 17. Project Structure

```
AgriSoil AI/
├── backend/                          # Python FastAPI Backend
│   ├── app/
│   │   ├── api/v1/                   # API route handlers (7 files)
│   │   ├── core/                     # Config, database, security
│   │   ├── dependencies/             # JWT verification
│   │   ├── models/                   # SQLAlchemy ORM models (4 files)
│   │   ├── schemas/                  # Pydantic schemas (5 files)
│   │   ├── services/                 # Business logic (8 files)
│   │   │   ├── ml_service.py         # ML model loading, prediction, hybrid analysis
│   │   │   ├── rule_engine.py        # 23-crop rules + drainage validation
│   │   │   ├── payment.py            # Razorpay integration
│   │   │   └── ...
│   │   ├── ml_models/                # Trained .joblib model files
│   │   └── main.py                   # FastAPI entry point
│   ├── generate_dataset.py           # Crop dataset generator
│   ├── generate_soil_dataset.py      # Soil dataset generator
│   ├── train_enhanced_model.py       # Crop model training
│   ├── train_improved_soil_model.py  # Soil model training
│   └── requirements.txt
│
├── frontend/                         # React + Vite Frontend
│   ├── src/
│   │   ├── pages/                    # 22 page components
│   │   │   ├── Home.jsx              # Hero + features + soil types
│   │   │   ├── AuthPage.jsx          # Unified login/register
│   │   │   ├── SoilInput.jsx         # 8-param form + drainage + probabilities
│   │   │   ├── TermsOfService.jsx    # Legal - Terms
│   │   │   ├── PrivacyPolicy.jsx     # Legal - Privacy  
│   │   │   ├── Shop.jsx / Cart.jsx / MyOrders.jsx
│   │   │   ├── admin/                # 5 admin pages
│   │   │   └── delivery/             # 2 delivery staff pages
│   │   ├── components/               # Navbar, ProtectedRoute, AdminRoute, DeliveryRoute
│   │   ├── services/                 # 7 API service modules
│   │   ├── context/AuthContext.jsx   # Global auth state
│   │   └── App.jsx                   # Root routing (20+ routes)
│   └── package.json
│
├── ml_model/                         # ML training datasets
│   └── datasets/                     # CSV files (crop + soil)
│
└── Project Explanation.md            # This file
```

---

## 18. How It All Works Together

```
1. LANDING
   User visits AgriSoil AI → sees hero with farmer image,
   features, soil types → clicks "Start Soil Analysis"

2. SOIL ANALYSIS (No Login Required)
   Enters 8 parameters (N, P, K, pH, temp, humidity, rainfall, drainage)
   → Frontend validates ranges → POST to /api/v1/model/hybrid-analyze

3. BACKEND PROCESSING
   a) ML Soil Classification → "Red Loam" (85%)
   b) ML Crop Recommendation → "Coffee" (65%) + all probabilities
   c) Rule Validation (7 checks including drainage):
      - pH ✅, Soil ✅, Rainfall ✅, Temp ✅, Humidity ✅, Nutrients ✅, Drainage ✅
   d) Score = 60% × ML + 40% × Rules = 99.4% → "Excellent"

4. RESULTS DISPLAYED
   - Soil type probabilities (top 6)
   - Crop probabilities (top 6)  
   - Recommended crop with quality badge
   - Insights, suggestions, drainage warnings
   - Related products for the recommended crop ONLY

5. SHOPPING (Login Required)
   "Add to Cart" → redirected to login if not authenticated
   → Sign in (email/password OR Google) → JWT stored
   → Add to cart → Navigate to /cart

6. CHECKOUT (Razorpay)
   Address form: House, Landmark, City, District, State, Pincode, Phone
   → Razorpay popup → Payment verified → Order confirmed, stock deducted

7. ORDER TRACKING
   /my-orders → status: Confirmed → Processing → Shipped → Delivered

8. ADMIN OPERATIONS
   Dashboard analytics → Manage products → View orders with addresses
   → Assign delivery staff (manual or auto by district)

9. DELIVERY STAFF
   /delivery/login → View assigned orders with full customer details
   → Mark as Shipped → Delivered → Update profile
```

---

## 19. Version History

| Version | Date | Key Changes |
|---------|------|-------------|
| **v1.0** | Jan 2026 | Initial release: Basic ML models, shop, cart |
| **v1.1** | Jan 2026 | SQLite integration, admin panel |
| **v1.2** | Feb 2026 | Google OAuth, Twitter OAuth, Razorpay payments |
| **v1.3** | Feb 2026 | Delivery staff system, district-based auto-assign |
| **v1.4** | Feb 2026 | Structured address forms, admin analytics (Recharts) |
| **v1.5** | Feb 2026 | Product detail page, order management improvements |
| **v2.0** | Mar 2026 | **Major ML overhaul**: 97.6% accuracy crop model, annual rainfall scale fix, hybrid analysis improvements |
| **v2.1** | Mar 2026 | **Drainage/waterlogging** parameter added to analysis, rule engine, and UI |
| **v2.2** | Mar 2026 | **Crop probabilities** display, product recommendations fix (recommended crop only) |
| **v2.3** | Mar 2026 | **UI redesign**: Hero section with farmer image, unified backgrounds, navbar cleanup |
| **v2.4** | Mar 2026 | **Legal pages**: Terms of Service, Privacy Policy with proper routing across all pages |

---

## Summary

**AgriSoil AI** is a comprehensive agricultural intelligence platform that bridges the gap between modern AI technology and traditional farming wisdom. By combining **machine learning models** (97.6% accuracy) trained on 10,000+ scientifically generated samples with a **rule engine** encoding agricultural knowledge for 23 crops and 11 soil types — including **drainage/waterlogging risk assessment** — it delivers recommendations that are both **data-driven** and **agriculturally sound**, specifically tailored for Kerala's unique landscape.

The **hybrid approach** (60% ML + 40% Rules) with automatic fallback ensures farmers always receive actionable, validated crop recommendations with full **probability distributions** for both soil types and crops. The platform goes beyond analysis — users can purchase recommended products through the integrated **e-commerce marketplace with Razorpay payments**, while district-based **delivery staff management** ensures orders reach farmers efficiently. With **three distinct roles** (Customer, Admin, Delivery Staff), each with dedicated dashboards, proper **Terms of Service and Privacy Policy** pages, and a premium dark-themed UI — AgriSoil AI provides a complete end-to-end agricultural commerce solution ready for real-world deployment.

---

*© 2026 AgriSoil AI. Built with ❤️ for farmers.*
