# Database Schema Documentation

This document describes the database tables and their fields for the Agri-Soil AI E-commerce backend.

## Tables Created

The following tables are automatically created when the application starts:

1. **users** - User accounts
2. **products** - Seeds and crops for sale
3. **orders** - Customer orders
4. **order_items** - Individual items within each order

---

## 1. Users Table (`users`)

Stores user account information.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | Primary Key, Index | Unique user ID |
| `email` | String | Unique, Index, Not Null | User's email address |
| `username` | String | Unique, Index, Not Null | Unique username for login |
| `full_name` | String | Nullable | User's full name |
| `phone_number` | String | Nullable | User's phone number (e.g., "+91 98765 43210") |
| `hashed_password` | String | Not Null | Bcrypt hashed password |
| `is_active` | Boolean | Default: True | Whether the account is active |
| `is_admin` | Boolean | Default: False | Admin privileges flag |
| `created_at` | DateTime | Auto-set on create | Account creation timestamp |
| `updated_at` | DateTime | Auto-updated | Last update timestamp |

### Relationships

- One user can have **many orders** (one-to-many relationship)

### Registration Form Fields Mapping

The registration form includes:
- ✅ **Full Name** → `full_name`
- ✅ **Username** → `username` (unique)
- ✅ **Email Address** → `email` (unique)
- ✅ **Phone Number** → `phone_number`
- ✅ **Password** → `hashed_password` (stored as hash)

---

## 2. Products Table (`products`)

Stores available seeds and crops for sale.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | Primary Key, Index | Unique product ID |
| `name` | String | Not Null, Index | Product name (e.g., "Wheat Seeds") |
| `description` | Text | Nullable | Detailed product description |
| `category` | String | Not Null, Index | Product category (e.g., "seeds", "crops") |
| `price` | Float | Not Null | Product price |
| `stock_quantity` | Integer | Default: 0 | Available inventory count |
| `image_url` | String | Nullable | URL/path to product image |
| `is_available` | Boolean | Default: True | Whether product is available for sale |
| `created_at` | DateTime | Auto-set on create | Product creation timestamp |
| `updated_at` | DateTime | Auto-updated | Last update timestamp |

### Relationships

- One product can appear in **many order_items** (one-to-many relationship)

---

## 3. Orders Table (`orders`)

Stores customer orders.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | Primary Key, Index | Unique order ID |
| `user_id` | Integer | Foreign Key → users.id, Not Null | ID of the user who placed the order |
| `total_amount` | Float | Not Null | Total order amount |
| `status` | Enum | Default: PENDING | Order status (pending, confirmed, processing, shipped, delivered, cancelled) |
| `shipping_address` | String | Not Null | Delivery address |
| `phone_number` | String | Nullable | Contact phone for this order |
| `notes` | String | Nullable | Additional order notes |
| `created_at` | DateTime | Auto-set on create | Order creation timestamp |
| `updated_at` | DateTime | Auto-updated | Last update timestamp |

### Status Values

- `PENDING` - Order placed but not yet confirmed
- `CONFIRMED` - Order confirmed
- `PROCESSING` - Order being processed
- `SHIPPED` - Order shipped
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled

### Relationships

- One order belongs to **one user** (many-to-one relationship)
- One order can have **many order_items** (one-to-many relationship)

---

## 4. Order Items Table (`order_items`)

Stores individual items within each order (junction table).

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | Primary Key, Index | Unique order item ID |
| `order_id` | Integer | Foreign Key → orders.id, Not Null | ID of the parent order |
| `product_id` | Integer | Foreign Key → products.id, Not Null | ID of the product |
| `quantity` | Integer | Not Null | Quantity of this product in the order |
| `price` | Float | Not Null | Price per unit at time of purchase (preserves historical pricing) |
| `created_at` | DateTime | Auto-set on create | Order item creation timestamp |

### Relationships

- One order_item belongs to **one order** (many-to-one relationship)
- One order_item references **one product** (many-to-one relationship)

### Purpose

This table stores:
- What products were ordered
- How many of each product
- The price at the time of purchase (important if product prices change)

---

## Database Initialization

Tables are automatically created when the FastAPI application starts for the first time using:

```python
Base.metadata.create_all(bind=engine)
```

This is defined in `app/main.py`.

---

## Notes

- All timestamps use timezone-aware DateTime
- Foreign keys maintain referential integrity
- Cascading deletes are configured for order_items when an order is deleted
- The database starts as SQLite (`agrisoil.db` file) but can be switched to PostgreSQL via environment variable
- Password security: All passwords are hashed using bcrypt before storage
