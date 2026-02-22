from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import get_password_hash
import sys
import re

def create_admin(username, email, password):
    # Basic validation
    if not username or not email or not password:
        print("Error: All fields (username, email, password) are required!")
        return
        
    if "@" not in email:
        print("Error: Please enter a valid email address.")
        return

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # Check if user exists
        user_by_email = db.query(User).filter(User.email == email).first()
        user_by_username = db.query(User).filter(User.username == username).first()
        
        if user_by_email:
            print(f"User with email {email} already exists.")
            user = user_by_email
        elif user_by_username:
            print(f"User with username {username} already exists.")
            user = user_by_username
        else:
            user = None

        if user:
            print(f"User '{user.username}' (email: {user.email}) already exists.")
            if not user.is_admin:
                print("Promoting to admin...")
                user.is_admin = True
                db.commit()
                print("User promoted to Admin successfully!")
            else:
                print("User is already an Admin.")
            return

        print("Creating new Admin user...")
        hashed_password = get_password_hash(password)
        new_admin = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            full_name="System Administrator",
            is_active=True,
            is_admin=True
        )
        db.add(new_admin)
        db.commit()
        print(f"Admin user '{username}' created successfully!")
        
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("--- Create Admin User ---")
    if len(sys.argv) == 4:
        create_admin(sys.argv[1], sys.argv[2], sys.argv[3])
    else:
        username = input("Enter admin username: ")
        email = input("Enter admin email: ")
        password = input("Enter admin password: ")
        create_admin(username, email, password)
