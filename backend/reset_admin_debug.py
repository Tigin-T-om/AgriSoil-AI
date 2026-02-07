from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def reset_admin_password():
    db: Session = SessionLocal()
    try:
        username = "admin"
        new_password = "admin@123"
        
        print(f"Searching for user '{username}'...")
        user = db.query(User).filter(User.username == username).first()
        
        if not user:
            print(f"❌ User '{username}' not found in the database!")
            # List all users to debug
            print("Listing all users found:")
            all_users = db.query(User).all()
            for u in all_users:
                print(f" - ID: {u.id}, Username: '{u.username}', Email: '{u.email}', IsAdmin: {u.is_admin}")
            return

        print(f"✅ User found: ID {user.id}, Username '{user.username}', Email '{user.email}'")
        
        print("Resetting password...")
        user.hashed_password = get_password_hash(new_password)
        db.commit()
        print(f"✅ Password for '{username}' has been RESET to '{new_password}'")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()
