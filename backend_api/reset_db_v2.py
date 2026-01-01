from database import engine, Base
from sqlalchemy import text
import models

def reset_database():
    try:
        # Connect to 'postgres' database to kill connections to 'florry_database'
        # Actually, we can try to do it from the same engine if we have permissions
        with engine.connect() as conn:
            print("Terminating existing connections to database...")
            try:
                # This might fail if not superuser, but worth a try
                conn.execute(text("""
                    SELECT pg_terminate_backend(pid) 
                    FROM pg_stat_activity 
                    WHERE datname = 'florry_database' 
                    AND pid <> pg_backend_pid();
                """))
                conn.commit()
            except Exception as e:
                print(f"Warning (could not kill connections): {e}")

            print("Dropping all tables with CASCADE...")
            conn.execute(text("DROP TABLE IF EXISTS notifications CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS ratings CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS cart CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS reports CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS order_items CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS orders CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS flowers CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS riders CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS admin CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS support_messages CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE;"))
            conn.commit()
            print("✓ Tables dropped successfully")

        print("Creating all tables...")
        Base.metadata.create_all(bind=engine)
        print("✓ Tables created successfully with new schema")
        
        print("\nSuccessfully changed image URL columns to Text type.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    reset_database()
