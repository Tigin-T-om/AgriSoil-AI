"""
Database Migration Script
========================
Adds new payment-related columns to the orders table.
Run this once after adding Razorpay payment fields.

Usage: python migrate_add_payment_fields.py
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
    
    # Check existing columns in orders table
    cursor.execute("PRAGMA table_info(orders)")
    existing_columns = {row[1] for row in cursor.fetchall()}
    
    new_columns = {
        "payment_status": "VARCHAR DEFAULT 'pending'",
        "razorpay_order_id": "VARCHAR",
        "razorpay_payment_id": "VARCHAR",
        "razorpay_signature": "VARCHAR",
    }
    
    added = 0
    for col_name, col_type in new_columns.items():
        if col_name not in existing_columns:
            try:
                cursor.execute(f"ALTER TABLE orders ADD COLUMN {col_name} {col_type}")
                print(f"  ✅ Added column: {col_name}")
                added += 1
            except sqlite3.OperationalError as e:
                print(f"  ⚠️ Column {col_name}: {e}")
        else:
            print(f"  ⏭️ Column {col_name} already exists")
    
    conn.commit()
    conn.close()
    
    if added > 0:
        print(f"\n✅ Migration complete! Added {added} new column(s).")
    else:
        print(f"\n✅ No migration needed — all columns already exist.")


if __name__ == "__main__":
    print("🔄 Migrating orders table for Razorpay payment fields...\n")
    migrate()
