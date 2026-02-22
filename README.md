# 🌱 Agri-Soil AI

An intelligent agricultural platform that uses machine learning to analyze soil properties and recommend suitable crops.

## ✨ Features

- **Soil Analysis** - Input soil parameters (pH, nitrogen, phosphorus, etc.) and get AI-powered predictions
- **Crop Recommendations** - Get personalized crop suggestions based on soil conditions
- **Agricultural Shop** - Browse and purchase farming products
- **Order Management** - Track your orders with ease
- **Admin Dashboard** - Manage products, orders, and users

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router |
| **Backend** | FastAPI, SQLAlchemy, SQLite |
| **ML** | Scikit-learn, Pandas, NumPy |
| **Auth** | JWT (python-jose), Passlib, Bcrypt |

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
Agri-Soil-AI/
├── backend/          # FastAPI server
│   ├── app/          # Application code
│   │   ├── api/      # API routes
│   │   ├── models/   # Database models
│   │   ├── schemas/  # Pydantic schemas
│   │   └── services/ # Business logic
│   └── data/         # Datasets
├── frontend/         # React application
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
└── ml_model/         # ML training scripts & models
```

## 📝 API Endpoints

- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/prediction/analyze` - Soil analysis
- `GET /api/v1/products` - List products
- `POST /api/v1/orders` - Create order

## 📄 License

MIT License
