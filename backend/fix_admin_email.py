from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User

def fix_admin_email():
    db: Session = SessionLocal()
    try:
        # Find admin user
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            print("Admin user not found!")
            return

        print(f"Found admin user. Current email: '{admin.email}'")
        
        # Check if email is invalid/empty
        if not admin.email or "@" not in admin.email:
            new_email = "admin@agri-soil.ai"
            print(f"Updating admin email to: {new_email}")
            admin.email = new_email
            db.commit()
            print("Admin email updated successfully!")
        else:
            print("Admin email appears valid. No changes needed.")
            
    except Exception as e:
        print(f"Error fixing admin email: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_admin_email()
