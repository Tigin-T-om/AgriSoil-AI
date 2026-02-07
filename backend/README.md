# AgriSoil AI E-commerce Backend

FastAPI backend for the AgriSoil AI e-commerce platform for selling seeds and crops to farmers.

## Features

- ✅ FastAPI framework
- ✅ SQLAlchemy ORM
- ✅ JWT authentication
- ✅ SQLite database (default)
- ✅ PostgreSQL support (switchable)
- ✅ Production-ready folder structure
- ✅ User registration and authentication
- ✅ Product management (CRUD)
- ✅ Order management
- ✅ Admin role support

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── api/                    # API routes
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py         # Authentication endpoints
│   │       ├── products.py     # Product endpoints
│   │       └── orders.py       # Order endpoints
│   ├── core/                   # Core functionality
│   │   ├── __init__.py
│   │   ├── config.py           # Configuration settings
│   │   ├── database.py         # Database setup
│   │   └── security.py         # Security utilities (JWT, password hashing)
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── product.py
│   │   └── order.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── product.py
│   │   └── order.py
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── product.py
│   │   └── order.py
│   └── dependencies/           # FastAPI dependencies
│       ├── __init__.py
│       └── auth.py
├── requirements.txt
├── .env.example
└── README.md
```

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# On Windows
venv\Scripts\activate

# On Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

5. Edit `.env` file with your configuration (optional, defaults work for SQLite)

## Running the Server

### Development

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### Production

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Database Configuration

### SQLite (Default)

The default configuration uses SQLite. The database file will be created automatically at `./agrisoil.db`.

### PostgreSQL

To switch to PostgreSQL:

1. Install PostgreSQL and create a database
2. Update `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/agrisoil
```

3. The database tables will be created automatically on first run.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get access token
- `GET /api/v1/auth/me` - Get current user info (requires authentication)

### Products
- `GET /api/v1/products/` - List all products (public)
- `GET /api/v1/products/{id}` - Get product by ID (public)
- `POST /api/v1/products/` - Create product (admin only)
- `PUT /api/v1/products/{id}` - Update product (admin only)
- `DELETE /api/v1/products/{id}` - Delete product (admin only)

### Orders
- `POST /api/v1/orders/` - Create a new order (authenticated)
- `GET /api/v1/orders/` - Get user's orders (authenticated)
- `GET /api/v1/orders/{id}` - Get order by ID (authenticated)
- `PATCH /api/v1/orders/{id}/status` - Update order status (admin only)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After logging in, include the token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

## Example Usage

### Register a User
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "farmer1",
    "password": "securepassword",
    "full_name": "John Farmer"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "farmer1",
    "password": "securepassword"
  }'
```

### Create Product (Admin)
```bash
curl -X POST "http://localhost:8000/api/v1/products/" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wheat Seeds",
    "description": "High quality wheat seeds",
    "category": "seeds",
    "price": 25.99,
    "stock_quantity": 100
  }'
```

## Testing

You can test the API using:
- FastAPI automatic interactive docs: http://localhost:8000/docs
- curl commands (examples above)
- Postman or similar API testing tools

## License

This project is part of the AgriSoil AI platform.
