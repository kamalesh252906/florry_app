from database import engine
from sqlalchemy import text

def cleanup_db():
    print("Cleaning up database (removing 'riders' and 'notifications' tables)...")
    try:
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS notifications CASCADE;"))
            print("✓ Dropped table 'notifications'")
            conn.execute(text("DROP TABLE IF EXISTS riders CASCADE;"))
            print("✓ Dropped table 'riders'")
            conn.commit()
    except Exception as e:
        print(f"Error while dropping tables: {e}")
        print("Note: If the tables didn't exist or 'CASCADE' isn't supported (e.g. SQLite), this might have failed safely.")

if __name__ == "__main__":
    cleanup_db()
