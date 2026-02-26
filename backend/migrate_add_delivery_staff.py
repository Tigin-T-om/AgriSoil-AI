"""
Database Migration Script - Delivery Staff Feature
===================================================
Adds:
  1. delivery_staff table
  2. delivery_staff_id, district, delivery_notes columns to orders table

Usage: python migrate_add_delivery_staff.py
"""

import sqlite3
import os


def migrate():
    db_path = os.path.join(os.path.dirname(__file__), "agrisoil.db")

    if not os.path.exists(db_path):
        print("❌ Database file not found. Start the backend first to create it.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # ── 1. Create delivery_staff table if it doesn't exist ──
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS delivery_staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR UNIQUE NOT NULL,
            username VARCHAR UNIQUE NOT NULL,
            full_name VARCHAR NOT NULL,
            phone_number VARCHAR,
            hashed_password VARCHAR NOT NULL,
            district VARCHAR NOT NULL,
            is_available BOOLEAN DEFAULT 1,
            is_active BOOLEAN DEFAULT 1,
            active_orders_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP
        )
    """)
    print("  ✅ delivery_staff table ensured")

    # Create indexes
    try:
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_delivery_staff_email ON delivery_staff (email)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_delivery_staff_username ON delivery_staff (username)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_delivery_staff_district ON delivery_staff (district)")
        print("  ✅ delivery_staff indexes ensured")
    except sqlite3.OperationalError as e:
        print(f"  ⚠️ Index creation: {e}")

    # ── 2. Add new columns to orders table ──
    cursor.execute("PRAGMA table_info(orders)")
    existing_columns = {row[1] for row in cursor.fetchall()}

    new_columns = {
        "district": "VARCHAR",
        "delivery_staff_id": "INTEGER REFERENCES delivery_staff(id)",
        "delivery_notes": "TEXT",
    }

    added = 0
    for col_name, col_type in new_columns.items():
        if col_name not in existing_columns:
            try:
                cursor.execute(f"ALTER TABLE orders ADD COLUMN {col_name} {col_type}")
                print(f"  ✅ Added column to orders: {col_name}")
                added += 1
            except sqlite3.OperationalError as e:
                print(f"  ⚠️ Column {col_name}: {e}")
        else:
            print(f"  ⏭️ Column {col_name} already exists in orders")

    # Create index on orders.district
    try:
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_orders_district ON orders (district)")
        print("  ✅ orders.district index ensured")
    except sqlite3.OperationalError as e:
        print(f"  ⚠️ Orders district index: {e}")

    conn.commit()
    conn.close()

    if added > 0:
        print(f"\n✅ Migration complete! Added {added} new column(s) to orders.")
    else:
        print(f"\n✅ No migration needed — all columns already exist.")
    print("✅ delivery_staff table is ready.")


if __name__ == "__main__":
    print("🔄 Migrating database for Delivery Staff feature...\n")
    migrate()
